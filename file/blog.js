// Script untuk membuat post di Blogspot dengan isi artikel dari AI Gemini

const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyAnPO90a0Q2nF4SrxGV07EnGfYh-PQwHyw';
const BLOGGER_API_KEY = 'AIzaSyCVxytTOozO9H3Sv_pQReCYUZ6SWyI_wkQ';
const BLOG_ID = 'n6550260102335539072';

async function generateArticle(title) {
    const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
            contents: [{
                parts: [{ text: title }]
            }]
        },
        { headers: { 'Content-Type': 'application/json' } }
    );

    const articleContent = geminiResponse.data.candidates[0].content.parts[0].text;
    return articleContent;
}

async function postToBlogspot(title, content) {
    const blogspotResponse = await axios.post(
        `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/`,
        {
            title: title,
            content: content
        },
        { headers: { 'Authorization': `Bearer ${BLOGGER_API_KEY}` } }
    );

    return blogspotResponse.data;
}

async function createPost(title) {
    try {
        const content = await generateArticle(title);
        const post = await postToBlogspot(title, content);
        console.log('Post successfully created:', post.url);
    } catch (error) {
        console.error('Error creating post:', error);
    }
}

// Contoh penggunaan
createPost('How AI Transforms Content Creation');
