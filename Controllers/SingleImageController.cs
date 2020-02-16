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

            return File(ms.ToArray(), "image/png", "anything.png");
        }

        public FileResult DownloadImage()
        {
            var directory = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development"
                ? "public"
                : "build";

            ImageDetails details;

            using (var reader = new StreamReader(Request.Body))
            {
                var body = reader.ReadToEnd();

                details = JObject.Parse(body).ToObject<ImageDetails>();
            }

            var img = Image.FromFile($"ClientApp/{directory}/{details.Base}");

            var g = Graphics.FromImage(img);

            foreach (var layer in details.Layers)
            {
                Image layerImg = Image.FromFile($"ClientApp/{directory}/{layer}");
                g.DrawImage(layerImg, 0, 0);
            }

            foreach (var phrase in details.Phrases)
            {
                DrawPhrase(phrase, img, g);
            }

            var lotoPhrase = new Phrase
            {
                BackgroundColor = "#000000",
                HorizontalAlignment = 0,
                Scale = "small",
                Text = "lotographia.com",
                TextColor = "#FFFFFF",
                VerticalAlignment = 1,
                X = 0.025M,
                Y = 0.975M
            };

            DrawPhrase(lotoPhrase, img, g);
            
            img = ResizeImage(img, details.Width, details.Height);

            var ms = new MemoryStream();

            img.Save(ms, ImageFormat.Jpeg);

            return File(ms.ToArray(), "image/jpeg", "image.jpg");
        }

        private void DrawPhrase(Phrase phrase, Image img, Graphics g)
        {
            float xRatio = 34f / 55f;
            float yRatio = 21f / 20f;

            if (string.IsNullOrEmpty(phrase.Text))
                return;

            var fontFamily = new FontFamily(System.Drawing.Text.GenericFontFamilies.Monospace);
            var scale = GetScale(phrase.Scale);
            var emSize = img.Width / (100f / scale);
            var font = new Font(fontFamily, emSize, FontStyle.Bold);
            var size = new Size((int)(phrase.Text.Length * emSize * xRatio) + (int)(0.5f * emSize * xRatio), (int)(emSize * yRatio));

            var point = new Point(
                decimal.ToInt32(phrase.X * img.Width) - decimal.ToInt32(size.Width * phrase.HorizontalAlignment),
                decimal.ToInt32(phrase.Y * img.Height) - decimal.ToInt32(size.Height * phrase.VerticalAlignment));

            var rectangle = new Rectangle(point, size);
            var stringColor = ColorTranslator.FromHtml(phrase.TextColor);
            var stringBrush = new SolidBrush(stringColor);
            var rectangleColor = ColorTranslator.FromHtml(phrase.BackgroundColor);
            var rectangleBrush = new SolidBrush(rectangleColor);

            g.FillRectangle(rectangleBrush, rectangle);
            g.DrawString(phrase.Text, font, stringBrush, point);
        }

        private float GetScale(string scale)
        {
            return scale switch
            {
                "small" => 2f,
                "medium" => 3f,
                _ => 3f
            };
        }

        // borrowed from internet

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

                using (var wrapMode = new ImageAttributes())
                {
                    wrapMode.SetWrapMode(WrapMode.TileFlipXY);
                    graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                }
            }

            return destImage;
        }
    }

    public class ImageFileDetails
    {
        public string FileName { get; set; }
    }

    public class ImageDetails
    {
        public string Base { get; set; }
        public int Height { get; set; }
        public string[] Layers { get; set; }
        public Phrase[] Phrases { get; set; }
        public int Width { get; set; }
    }

    public class Phrase
    {
        public string BackgroundColor { get; set; }
        public decimal HorizontalAlignment { get; set; }
        public string Scale { get; set; }
        public string Text { get; set; }
        public string TextColor { get; set; }
        public decimal VerticalAlignment { get; set; }
        public decimal X { get; set; }
        public decimal Y { get; set; }
    }
}
