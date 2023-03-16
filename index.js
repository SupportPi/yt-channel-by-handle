import dotenv from 'dotenv';
import colors from 'colors';
import fetch from 'node-fetch';
import express from 'express';
dotenv.config();
colors.enable();
const app = express();
const search_str = `<meta itemprop="channelId" content="`;
const search_str_len = search_str.length;
async function get_id_of(handle){
    const page = await (await fetch(`https://www.youtube.com/@${
        handle.substring(0, 1) === '@' ? handle.substring(1) : handle
    }`)).text();
    const index = page.indexOf(`<meta itemprop="channelId"`);
    if(index ===-1) return null;
    const closin = page.substring(index, page.indexOf(`"`, index + search_str_len)+2);
    return closin.substring(closin.indexOf(search_str) +  search_str_len , closin.length - 2)
}
async function run(){
    app.get('/', async (req, res)=>{
        if(!req.query.handle){
            res.json({
                success: false,
                id: null
            });
        } else {
        req.query.handle = req.query.handle.replaceAll(`"`, ""); // Filters out " from handle param
        let id = null;
        try {
            id = await get_id_of(req.query.handle);
        } catch (err){
            id = null
            console.error("Error!".red, err.toString().red);
        } finally {
            if(!!id)
                console.info(`@${req.query.handle.substring(0, 1) === '@' ? req.query.handle.substring(1) : req.query.handle}'s`, "channelId: ", id);
            res.json({
                id: id ?? null,
                success: !!id, 
             });
        }
    }
    });
    app.listen(process.env.PORT, async () => {
        console.info("Running on Port:".yellow, process.env.PORT.toString().green);
    });
}
run();