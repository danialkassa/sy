const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const images = [
    {
        prompt: 'Modern Chinese power tools manufacturing factory assembly line with workers in safety gear, bright industrial lighting, rows of power drills on conveyor belt, clean professional facility, wide angle shot',
        savePath: 'c:\\Users\\DanielkassaMuruts\\Documents\\B2B\\html1-suite\\public-website\\images\\factory.jpg',
        name: 'FACTORY'
    },
    {
        prompt: 'Large industrial warehouse filled with organized boxes and pallets of power tools for export shipping, forklift in background, shelving units with product inventory, professional logistics facility',
        savePath: 'c:\\Users\\DanielkassaMuruts\\Documents\\B2B\\html1-suite\\public-website\\images\\warehouse.jpg',
        name: 'WAREHOUSE'
    },
    {
        prompt: 'Professional power tools showroom display with drill drivers angle grinders and saws on modern display stands, yellow accent lighting, clean corporate presentation, B2B trade show style',
        savePath: 'c:\\Users\\DanielkassaMuruts\\Documents\\B2B\\html1-suite\\public-website\\images\\showroom.jpg',
        name: 'SHOWROOM'
    },
    {
        prompt: 'Quality control testing laboratory for power tools, engineer testing drill torque on testing equipment, measurement instruments, safety certification testing station, professional industrial setting',
        savePath: 'c:\\Users\\DanielkassaMuruts\\Documents\\B2B\\html1-suite\\public-website\\images\\quality-lab.jpg',
        name: 'QUALITY LAB'
    }
];

function httpsGet(url, options = {}) {
    return new Promise((resolve, reject) => {
        const opts = {
            ...options,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                ...options.headers
            }
        };

        https.get(url, opts, (res) => {
            resolve(res);
        }).on('error', reject);
    });
}

function downloadData(url, options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const res = await httpsGet(url, options);

            if (res.statusCode >= 300 && res.statusCode < 400) {
                const redirectUrl = res.headers.location;
                resolve({ redirect: redirectUrl, statusCode: res.statusCode });
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const data = Buffer.concat(chunks);
                resolve({ data, statusCode: res.statusCode, headers: res.headers, finalUrl: url });
            });
            res.on('error', reject);
        } catch (e) {
            reject(e);
        }
    });
}

async function generateAndDownload(img) {
    console.log(`\n=== Generating ${img.name} image ===`);

    const encodedPrompt = encodeURIComponent(img.prompt);
    const apiUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodedPrompt}&image_size=landscape_16_9`;

    // Step 1: Call the API
    console.log('  Calling API...');
    try {
        const apiResult = await downloadData(apiUrl);

        if (apiResult.redirect) {
            console.log(`  API returned redirect: ${apiResult.redirect}`);
            // Follow redirect
            const redirectResult = await downloadData(apiResult.redirect);
            if (redirectResult.data) {
                const md5 = crypto.createHash('md5').update(redirectResult.data).digest('hex');
                fs.writeFileSync(img.savePath, redirectResult.data);
                console.log(`  SUCCESS via redirect: ${redirectResult.data.length} bytes, MD5: ${md5}`);
                return true;
            }
        }

        if (!apiResult.data) {
            console.log('  FAILED: No data from API');
            return false;
        }

        const responseText = apiResult.data.toString('utf-8');
        console.log(`  API Response: ${responseText.substring(0, 200)}`);

        // Parse the image URL from markdown
        const match = responseText.match(/!\[.*\]\((https?:\/\/[^)]+)\)/);
        if (!match) {
            console.log('  FAILED: Could not parse image URL');
            return false;
        }

        const imageUrl = match[1];
        console.log(`  Image URL: ${imageUrl}`);

        // Step 2: Get redirect URL
        const imageResult = await downloadData(imageUrl);
        if (imageResult.redirect) {
            console.log(`  Image redirect: ${imageResult.redirect}`);

            // Step 3: Download from redirect URL with Referer
            const finalResult = await downloadData(imageResult.redirect, {
                headers: { 'Referer': imageUrl }
            });

            if (finalResult.data) {
                const md5 = crypto.createHash('md5').update(finalResult.data).digest('hex');
                fs.writeFileSync(img.savePath, finalResult.data);
                console.log(`  SUCCESS: ${finalResult.data.length} bytes, MD5: ${md5}`);
                return true;
            }
        }

        if (imageResult.data) {
            const md5 = crypto.createHash('md5').update(imageResult.data).digest('hex');
            fs.writeFileSync(img.savePath, imageResult.data);
            console.log(`  SUCCESS (no redirect): ${imageResult.data.length} bytes, MD5: ${md5}`);
            return true;
        }

        console.log('  FAILED: Could not download image');
        return false;
    } catch (e) {
        console.log(`  FAILED: ${e.message}`);
        return false;
    }
}

async function main() {
    for (const img of images) {
        await generateAndDownload(img);
    }

    // Verify all files
    console.log('\n=== File Verification ===');
    for (const img of images) {
        if (fs.existsSync(img.savePath)) {
            const stats = fs.statSync(img.savePath);
            const data = fs.readFileSync(img.savePath);
            const md5 = crypto.createHash('md5').update(data).digest('hex');
            const isJpeg = data[0] === 0xFF && data[1] === 0xD8;
            console.log(`  EXISTS: ${path.basename(img.savePath)} | Size: ${stats.size} bytes | JPEG: ${isJpeg} | MD5: ${md5}`);
        } else {
            console.log(`  MISSING: ${path.basename(img.savePath)}`);
        }
    }

    // Check uniqueness
    console.log('\n=== Uniqueness Check ===');
    const hashes = {};
    for (const img of images) {
        if (fs.existsSync(img.savePath)) {
            const data = fs.readFileSync(img.savePath);
            const md5 = crypto.createHash('md5').update(data).digest('hex');
            const name = img.savePath.split('\\').pop();
            if (hashes[md5]) {
                console.log(`  DUPLICATE: ${name} is same as ${hashes[md5]}`);
            } else {
                hashes[md5] = name;
            }
        }
    }
    console.log(`  Unique images: ${Object.keys(hashes).length} out of ${images.length}`);
}

const path = require('path');
main().catch(console.error);
