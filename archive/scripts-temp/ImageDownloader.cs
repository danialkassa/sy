using System;
using System.IO;
using System.Net;
using System.Net.Security;
using System.Security.Authentication;
using System.Text;

class ImageDownloader
{
    static void Main(string[] args)
    {
        ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;
        ServicePointManager.ServerCertificateValidationCallback = (sender, cert, chain, errors) => true;
        ServicePointManager.Expect100Continue = false;

        if (args.Length < 2)
        {
            Console.WriteLine("Usage: ImageDownloader <url> <outputfile>");
            return;
        }

        string url = args[0];
        string outFile = args[1];

        try
        {
            Console.WriteLine("Downloading: " + url);

            CookieContainer cookies = new CookieContainer();
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
            req.Method = "GET";
            req.AllowAutoRedirect = true;
            req.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
            req.Accept = "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";
            req.Headers.Add("Accept-Language", "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7");
            req.Headers.Add("Accept-Encoding", "identity");
            req.CookieContainer = cookies;
            req.Timeout = 120000;

            using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
            {
                Console.WriteLine("Status: " + resp.StatusCode + " " + resp.StatusDescription);
                Console.WriteLine("Content-Type: " + resp.ContentType);
                Console.WriteLine("Content-Length: " + resp.ContentLength);
                Console.WriteLine("Response URL: " + resp.ResponseUri);

                // Print all response headers for debugging
                Console.WriteLine("Response Headers:");
                foreach (string key in resp.Headers.AllKeys)
                {
                    Console.WriteLine("  " + key + ": " + resp.Headers[key]);
                }

                using (Stream stream = resp.GetResponseStream())
                using (FileStream fs = File.Create(outFile))
                {
                    stream.CopyTo(fs);
                }

                FileInfo fi = new FileInfo(outFile);
                Console.WriteLine("SUCCESS: " + fi.Length + " bytes saved to " + outFile);
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("FAILED: " + ex.Message);
            if (ex.InnerException != null)
                Console.WriteLine("Inner: " + ex.InnerException.Message);
        }
    }
}
