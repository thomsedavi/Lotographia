using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

namespace Lotographia.Controllers
{
    public class SingleImageController : Controller
    {
        public JsonResult GetProcessedTexts()
        {
            GetProcessedTextsBody details;

            using (var reader = new StreamReader(Request.Body))
            {
                var body = reader.ReadToEnd();

                details = JObject.Parse(body).ToObject<GetProcessedTextsBody>();
            }

            var g = Graphics.FromImage(new Bitmap(1, 1));

            var itemIndex = 0;
            var processedTexts = new ProcessedText[details.Lines.Length];
            var hasReachedEnd = false;

            for (var i = 0; i < details.Lines.Length; i++)
            {
                var line = details.Lines[i];

                var fontFamily = line.FontFamily switch
                {
                    "SansSerif" => new FontFamily(System.Drawing.Text.GenericFontFamilies.SansSerif),
                    "Serif" => new FontFamily(System.Drawing.Text.GenericFontFamilies.Serif),
                    _ => new FontFamily(System.Drawing.Text.GenericFontFamilies.Monospace),
                };

                var font = new Font(fontFamily, 16, FontStyle.Bold);

                var allowedWidth = new string('_', line.MaximumLength);
                var maximumTextSize = g.MeasureString(allowedWidth, font).Width;

                var nextLine = false;
                var shownText = "";
                var hiddenText = "";
                var finalTextBeforeNext = "";
                var finalTextAfterNext = "";

                while (!nextLine)
                {
                    if (itemIndex >= details.TextComponents.Length)
                    {
                        finalTextBeforeNext = finalTextAfterNext;
                        nextLine = true;
                        hasReachedEnd = true;
                    }
                    else
                    {
                        var item = details.TextComponents[itemIndex];

                        if (item.Type == TextComponentType.Return)
                        {
                            nextLine = true;
                            itemIndex++;
                        }
                        else if (item.Type == TextComponentType.Word)
                        {
                            finalTextBeforeNext = finalTextAfterNext;
                            finalTextAfterNext += item.VariantText.HiddenText;
                            var finalTextSize = g.MeasureString(finalTextAfterNext, font).Width;

                            if (finalTextSize > maximumTextSize)
                            {
                                nextLine = true;
                            }
                            else
                            {
                                shownText += item.VariantText.ShownText;
                                hiddenText += item.VariantText.HiddenText;
                                itemIndex++;
                            }
                        }
                        else if (item.Type == TextComponentType.Hyphen)
                        {
                            finalTextBeforeNext = finalTextAfterNext;
                            finalTextAfterNext += "-";
                            var finalTextSize = g.MeasureString(finalTextAfterNext, font).Width;

                            if (finalTextSize > maximumTextSize)
                            {
                                nextLine = true;
                            }
                            else
                            {
                                shownText += "-";
                                hiddenText += "-";
                                itemIndex++;
                            }
                        }
                        else if (item.Type == TextComponentType.Space)
                        {
                            finalTextBeforeNext = finalTextAfterNext;
                            finalTextAfterNext += " ";
                            var finalTextSize = g.MeasureString(finalTextAfterNext, font).Width;

                            if (finalTextSize > maximumTextSize)
                            {
                                nextLine = true;
                            }
                            else
                            {
                                shownText += " ";
                                hiddenText += " ";
                                itemIndex++;
                            }
                        }
                    }
                }

                // need to reduce somehow if last line
                var finalMax = g.MeasureString(finalTextBeforeNext.Trim(), font).Width;

                processedTexts[i] = new ProcessedText
                {
                    ShownText = shownText.Trim(),
                    HiddenText = hiddenText.Trim(),
                    RemainderFraction = maximumTextSize > 0 ? 1 - finalMax / maximumTextSize : -1,
                    DisplayRemainder = hasReachedEnd
                };
            }

            return Json(new
            {
                processedTexts,
                isTooLong = itemIndex < details.TextComponents.Length
            });
        }

        public FileResult DownloadImageFile()
        {
            var directory = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                ? "public"
                : "build";

            ImageFileDetails details;

            using (var reader = new StreamReader(Request.Body))
            {
                var body = reader.ReadToEnd();

                details = JObject.Parse(body).ToObject<ImageFileDetails>();
            }

            var img = Image.FromFile($"ClientApp/{directory}/{details.FileName}");

            var ms = new MemoryStream();

            img.Save(ms, ImageFormat.Png);

            return File(ms.ToArray(), "image/png", "image.png");
        }

        public FileResult DownloadImage()
        {
            var directory = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                ? "public"
                : "build";

            GameDetails details;

            using (var reader = new StreamReader(Request.Body))
            {
                var body = reader.ReadToEnd();

                details = JObject.Parse(body).ToObject<GameDetails>();
            }

            var img = Image.FromFile($"ClientApp/{directory}/{details.Base}");

            var g = Graphics.FromImage(img);

            foreach (var experiment in details.Layers)
            {
                if (!experiment.IsVisible)
                    continue;

                switch (experiment.LayerType)
                {
                    case LayerType.Image:
                        DrawImage(experiment, img, g, directory);
                        break;
                    case LayerType.Phrase:
                        DrawPhrase(experiment, img, g);
                        break;
                }
            }

            var lotoPhrase = new Layer
            {
                HorizontalAlignment = 1f,
                VerticalAlignment = 0f,
                HorizontalPosition = 0.025f,
                VerticalPosition = 0.975f,
                BackgroundColor = details.LotoBackground,
                FontSize = 9,
                HiddenText = "lotographia.com",
                TextColor = details.LotoColour
            };

            DrawPhrase(lotoPhrase, img, g);
            
            img = ResizeImage(img, details.Width, details.Height);

            var ms = new MemoryStream();

            img.Save(ms, ImageFormat.Jpeg);

            return File(ms.ToArray(), "image/jpeg", "image.jpg");
        }

        private void DrawImage(Layer experiment, Image img, Graphics g, string directory)
        {
            // shares this translation stuff with DrawText, could reuse
            g.TranslateTransform((experiment.HorizontalPosition) * img.Width, (experiment.VerticalPosition) * img.Height);
            g.RotateTransform(experiment.Rotation);

            Image layerImg = Image.FromFile($"ClientApp/{directory}/{experiment.FileName}");

            var point = new Point(
                Convert.ToInt32((layerImg.Width * experiment.HorizontalAlignment) - layerImg.Width),
                Convert.ToInt32((layerImg.Height * experiment.VerticalAlignment) - layerImg.Height));

            g.DrawImage(layerImg, point);

            g.RotateTransform(-experiment.Rotation);
            g.TranslateTransform(-((experiment.HorizontalPosition) * img.Width), -((experiment.VerticalPosition) * img.Height));
        }

        private void DrawPhrase(Layer layer, Image img, Graphics g)
        {
            var fontFamily = layer.FontFamily switch
            {
                "SansSerif" => new FontFamily(System.Drawing.Text.GenericFontFamilies.SansSerif),
                "Serif" => new FontFamily(System.Drawing.Text.GenericFontFamilies.Serif),
                _ => new FontFamily(System.Drawing.Text.GenericFontFamilies.Monospace),
            };

            var emSize = layer.FontSize;
            var font = new Font(fontFamily, emSize, FontStyle.Bold);
            var textSize = g.MeasureString(layer.HiddenText, font);
            var size = new Size((int)Math.Ceiling(textSize.Width), (int)Math.Ceiling(textSize.Height));

            g.TranslateTransform(layer.HorizontalPosition * img.Width, layer.VerticalPosition * img.Height);
            g.RotateTransform(layer.Rotation);

            var point = new Point(
                Convert.ToInt32((size.Width * layer.HorizontalAlignment) - size.Width),
                Convert.ToInt32((size.Height * layer.VerticalAlignment) - size.Height));

            if (layer.BackgroundColor.ToLower() != "none")
            {
                var rectangleColor = ColorTranslator.FromHtml(layer.BackgroundColor);
                var rectangleBrush = new SolidBrush(rectangleColor);
                var rectangle = new Rectangle(point, size);
                g.FillRectangle(rectangleBrush, rectangle);
            }

            var stringColor = ColorTranslator.FromHtml(layer.TextColor);
            var stringBrush = new SolidBrush(stringColor);

            g.DrawString(layer.HiddenText, font, stringBrush, point);

            g.RotateTransform(-layer.Rotation);
            g.TranslateTransform(-(layer.HorizontalPosition * img.Width), -(layer.VerticalPosition * img.Height));
        }

        // borrowed from innernet

        /// <summary>
        /// Resize the image to the specified width and height.
        /// </summary>
        /// <param name="image">The image to resize.</param>
        /// <param name="width">The width to resize to.</param>
        /// <param name="height">The height to resize to.</param>
        /// <returns>The resized image.</returns>
        public static Bitmap ResizeImage(Image image, int width, int height)
        {
            var destRect = new Rectangle(0, 0, width, height);
            var destImage = new Bitmap(width, height);

            destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

            using (var graphics = Graphics.FromImage(destImage))
            {
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = SmoothingMode.HighQuality;
                graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

                using var wrapMode = new ImageAttributes();
                wrapMode.SetWrapMode(WrapMode.TileFlipXY);
                graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
            }

            return destImage;
        }
    }

    public class ProcessedText
    {
        public string ShownText { get; set; }
        public string HiddenText { get; set; }
        public float RemainderFraction { get; set; }
        public bool DisplayRemainder { get; set; }
    }

    public class ImageFileDetails
    {
        public string FileName { get; set; }
    }

    public class GetProcessedTextsBody
    {
        public TextComponent[] TextComponents { get; set; }
        public Line[] Lines { get; set; }
    }

    public class Line
    {
        public int MaximumLength { get; set; }
        public string FontFamily { get; set; }
    }

    public class TextComponent
    {
        public TextComponentType Type { get; set; }
        public VariantText VariantText { get; set; }
    }

    public class VariantText
    {
        public string ShownText { get; set; }
        public string HiddenText { get; set; }
    }

    public enum TextComponentType
    {
        Hyphen,
        Return,
        Space,
        Word
    }

    public class GameDetails
    {
        public string Base { get; set; }
        public int Height { get; set; }
        public Layer[] Layers { get; set; }
        public int Width { get; set; }
        public string LotoColour { get; set; }
        public string LotoBackground { get; set; }
    }

    public enum LayerType
    {
        Phrase,
        Image
    }

    public class Layer
    {
        public LayerType LayerType { get; set; }
        public bool IsVisible { get; set; }
        public string FileName { get; set; }
        public string HiddenText { get; set; }
        public float HorizontalPosition { get; set; } = 0;
        public float VerticalPosition { get; set; } = 0;
        public float HorizontalAlignment { get; set; } = 1;
        public float VerticalAlignment { get; set; } = 1;
        public float Rotation { get; set; } = 0;
        public string BackgroundColor { get; set; }
        public string FontFamily { get; set; }
        public int FontSize { get; set; }
        public string TextColor { get; set; }
    }
}
