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

            var memoryStream = new MemoryStream();

            img.Save(memoryStream, ImageFormat.Png);

            return File(memoryStream.ToArray(), "image/png", "image.png");
        }

        public FileResult DownloadImage()
        {
            GameDetails details;

            using (var reader = new StreamReader(Request.Body))
            {
                var body = reader.ReadToEnd();

                details = JObject.Parse(body).ToObject<GameDetails>();
            }

            var baseImage = Image.FromFile($"ClientApp/{Directory}/{details.Base}");

            var graphics = Graphics.FromImage(baseImage);

            foreach (var layer in details.Layers)
            {
                if (!layer.IsVisible)
                    continue;

                Image layerImage = layer.LayerType switch
                {
                    LayerType.Phrase => GetPhraseImage(layer, graphics),
                    _ => Image.FromFile($"ClientApp/{Directory}/{layer.FileName}")
                };

                DrawLayer(baseImage, graphics, layer, layerImage);
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

            var lotoImage = GetPhraseImage(lotoPhrase, graphics);

            DrawLayer(baseImage, graphics, lotoPhrase, lotoImage);

            baseImage = ResizeImage(baseImage, details.Width, details.Height);

            var memoryStream = new MemoryStream();

            baseImage.Save(memoryStream, ImageFormat.Jpeg);

            return File(memoryStream.ToArray(), "image/jpeg", "image.jpg");
        }

        private Image GetPhraseImage(Layer layer, Graphics graphics)
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

            var textSize = graphics.MeasureString(layer.HiddenText, font);
            var textWidth = (int)Math.Ceiling(textSize.Width);
            var textHeight = (int)Math.Ceiling(textSize.Height);

            var stringColor = ColorTranslator.FromHtml(layer.TextColor);
            var stringBrush = new SolidBrush(stringColor);

            // based on MeasureString, this tends to have extra margin on right
            var textBitmap = new Bitmap(textWidth, textHeight);
            textBitmap.SetResolution(300, 300);

            var textGraphics = Graphics.FromImage(textBitmap);
            textGraphics.DrawString(layer.HiddenText, font, stringBrush, Point.Empty);

            if (layer.BackgroundColor.ToLower() == "none")
                return textBitmap;

            // find out how much to reduce the margin of the background by
            int rightMarginOffset = getRightMarginOffset(textBitmap);
            var backgroundColor = ColorTranslator.FromHtml(layer.BackgroundColor);

            var backgroundBitmap = new Bitmap(textWidth - rightMarginOffset, textHeight);
            backgroundBitmap.SetResolution(300, 300);

            for (var x = 0; x < backgroundBitmap.Width; x++)
            {
                for (var y = 0; y < backgroundBitmap.Height; y++)
                {
                    var pixel = textBitmap.GetPixel(x, y);
                    backgroundBitmap.SetPixel(x, y, pixel.A == 0 ? backgroundColor : pixel);
                }
            }

            return backgroundBitmap;
        }

        private void DrawLayer(Image image, Graphics graphics, Layer layer, Image layerImage)
        {
            var point = new Point(
                Convert.ToInt32((layerImage.Width * layer.HorizontalAlignment) - layerImage.Width),
                Convert.ToInt32((layerImage.Height * layer.VerticalAlignment) - layerImage.Height));

            graphics.TranslateTransform(layer.HorizontalPosition * image.Width, layer.VerticalPosition * image.Height);
            graphics.RotateTransform(layer.Rotation);

            graphics.DrawImage(layerImage, point);

            graphics.RotateTransform(-layer.Rotation);
            graphics.TranslateTransform(-(layer.HorizontalPosition * image.Width), -(layer.VerticalPosition * image.Height));

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

            var rightMarginDifference = rightMargin - leftMargin;

            return Math.Max(0, rightMarginDifference);
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
