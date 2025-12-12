import axios from "axios";
import * as cheerio from "cheerio";

export async function getInstagramPostData(postUrl) {
  try {
    const { data: html } = await axios.get(postUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
      }
    });

    const $ = cheerio.load(html);

    const imageUrl = $('meta[property="og:image"]').attr("content") || null;
    const caption = $('meta[property="og:description"]').attr("content") || "";
    
    // extract numbers from "123 likes, 4 comments"
    let likes = 0;
    let comments = 0;

    const match = caption.match(/(\d+)\s+likes?,\s+(\d+)\s+comments?/i);
    if (match) {
      likes = parseInt(match[1]);
      comments = parseInt(match[2]);
    }

    return {
      imageUrl,
      caption,
      likes,
      comments
    };
  } catch (err) {
    console.error("Instagram fetch error:", err.message);
    return null;
  }
}
