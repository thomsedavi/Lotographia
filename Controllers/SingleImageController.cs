using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.IO;

namespace Lotographia.Controllers
{
    public class SingleImageController : Controller
    {
        private static readonly string Directory = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                ? "public"
                : "build";
        private readonly PrivateFontCollection PrivateFontCollection;

        public SingleImageController()
        {
            // actually don't want to do this every time, make happen globally
            PrivateFontCollection = new PrivateFontCollection();
            PrivateFontCollection.AddFontFile($"ClientApp/{Directory}/Fonts/journal-webfont.ttf");
        }

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
                    "SansSerif" => new FontFamily(GenericFontFamilies.SansSerif),
                    "Serif" => new FontFamily(GenericFontFamilies.Serif),
                    "Journal" => PrivateFontCollection.Families[0],
                    _ => new FontFamily(GenericFontFamilies.Monospace),
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
            ImageFileDetails details;

            using (var reader = new StreamReader(Request.Body))
            {
                var body = reader.ReadToEnd();

                details = JObject.Parse(body).ToObject<ImageFileDetails>();
            }

            var img = Image.FromFile($"ClientApp/{Directory}/{details.FileName}");

            var ms = new MemoryStream();

            img.Save(ms, ImageFormat.Png);

            return File(ms.ToArray(), "image/png", "image.png");
        }

        public FileResult DownloadImage()
        {
            GameDetails details;

            using (var reader = new StreamReader(Request.Body))
            {
                var body = reader.ReadToEnd();

                details = JObject.Parse(body).ToObject<GameDetails>();
            }

            var img = Image.FromFile($"ClientApp/{Directory}/{details.Base}");

            var g = Graphics.FromImage(img);

            foreach (var experiment in details.Layers)
            {
                if (!experiment.IsVisible)
                    continue;

                switch (experiment.LayerType)
                {
                    case LayerType.Image:
                        DrawImage(experiment, img, g);
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

        private void DrawImage(Layer experiment, Image img, Graphics g)
        {
            Image layerImg = Image.FromFile($"ClientApp/{Directory}/{experiment.FileName}");

            var point = new Point(
                Convert.ToInt32((layerImg.Width * experiment.HorizontalAlignment) - layerImg.Width),
                Convert.ToInt32((layerImg.Height * experiment.VerticalAlignment) - layerImg.Height));

            // shares this translation stuff with DrawText, could reuse
            g.TranslateTransform(experiment.HorizontalPosition * img.Width, experiment.VerticalPosition * img.Height);
            g.RotateTransform(experiment.Rotation);

            g.DrawImage(layerImg, point);

            g.RotateTransform(-experiment.Rotation);
            g.TranslateTransform(-(experiment.HorizontalPosition * img.Width), -(experiment.VerticalPosition * img.Height));
        }

        private void DrawPhrase(Layer layer, Image img, Graphics g)
        {
            var fontFamily = layer.FontFamily switch
            {
                "SansSerif" => new FontFamily(GenericFontFamilies.SansSerif),
                "Serif" => new FontFamily(GenericFontFamilies.Serif),
                "Journal" => PrivateFontCollection.Families[0],
                _ => new FontFamily(GenericFontFamilies.Monospace),
            };

            var emSize = layer.FontSize;
            var font = new Font(fontFamily, emSize, FontStyle.Bold);

            var textSize = g.MeasureString(layer.HiddenText, font);
            var textWidth = (int)Math.Ceiling(textSize.Width);
            var textHeight = (int)Math.Ceiling(textSize.Height);

            var stringColor = ColorTranslator.FromHtml(layer.TextColor);
            var stringBrush = new SolidBrush(stringColor);

            var draftBitmap = new Bitmap(textWidth, textHeight);
            draftBitmap.SetResolution(300, 300);

            var graphics = Graphics.FromImage(draftBitmap);
            graphics.DrawString(layer.HiddenText, font, stringBrush, Point.Empty);

            int rightMarginOffset = getRightMarginOffset(draftBitmap);
            var finalBitmap = new Bitmap(textWidth - rightMarginOffset, textHeight);
            finalBitmap.SetResolution(300, 300);

            if (layer.BackgroundColor.ToLower() != "none")
            {
                var backgroundColor = ColorTranslator.FromHtml(layer.BackgroundColor);

                for (var x = 0; x < finalBitmap.Width; x++)
                {
                    for (var y = 0; y < finalBitmap.Height; y++)
                    {
                        var pixel = draftBitmap.GetPixel(x, y);
                        finalBitmap.SetPixel(x, y, pixel.A == 0 ? backgroundColor : pixel);
                    }
                }
            }

            var point = new Point(
                Convert.ToInt32((finalBitmap.Width * layer.HorizontalAlignment) - finalBitmap.Width),
                Convert.ToInt32((finalBitmap.Height * layer.VerticalAlignment) - finalBitmap.Height));

            // shares this translation stuff with DrawText, could reuse
            g.TranslateTransform(layer.HorizontalPosition * img.Width, layer.VerticalPosition * img.Height);
            g.RotateTransform(layer.Rotation);

            g.DrawImage(finalBitmap, point);

            g.RotateTransform(-layer.Rotation);
            g.TranslateTransform(-(layer.HorizontalPosition * img.Width), -(layer.VerticalPosition * img.Height));
        }

        // The Graphics.MeasureString method tends to add an increasing right margin the longer the string is.
        // Couldn't find a solution to this so wrote up this very brute force process to calculate how much
        // needs to be trimmed from the right margin. Basically draws the string and goes through the pixel
        // on the left and right until it hits a word, then returns the difference.
        // I need to measure how long this process takes but it does not appear to add much time to image generation.
        private int getRightMarginOffset(Bitmap bitmap)
        {
            var width = bitmap.Width;
            var height = bitmap.Height;

            var byteGrid = new byte[width][];

            for (var x = 0; x < width; x++)
            {
                var bytes = new byte[height];

                for (var y = 0; y < height; y++)
                {
                    var pixel = bitmap.GetPixel(x, y);
                    bytes[y] = pixel.A;
                }

                byteGrid[x] = bytes;
            }

            var leftMargin = -1;
            var leftXPosition = 0;
            var leftYPosition = 0;

            do
            {
                var thisByte = byteGrid[leftXPosition][leftYPosition];

                if (thisByte != 0)
                    leftMargin = leftXPosition;
                else if (leftYPosition < height - 1)
                    leftYPosition++;
                else
                {
                    leftYPosition = 0;
                    leftXPosition++;
                }
            }
            while (leftMargin == -1);

            var rightMargin = -1;
            var rightXPosition = 0;
            var rightYPosition = 0;

            do
            {
                var thisByte = byteGrid[width - 1 - rightXPosition][rightYPosition];

                if (thisByte != 0)
                    rightMargin = rightXPosition;
                else if (rightYPosition < height - 1)
                    rightYPosition++;
                else
                {
                    rightYPosition = 0;
                    rightXPosition++;
                }
            }
            while (rightMargin == -1);

            return rightMargin - leftMargin;
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
