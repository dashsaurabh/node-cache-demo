//Required Imports
const express = require('express');
const nodecache = require('node-cache');
require('isomorphic-fetch');

//Setting up Express
const app = express();

//Creating the node-cache instance
const cache = new nodecache({useClones: false})

//We are using the fake API available at https://jsonplaceholder.typicode.com/
const baseURL = 'https://jsonplaceholder.typicode.com/posts/';

//Pre-caching Popular Posts
[1, 2, 3].map(async (id) => {
    const fakeAPIURL = baseURL + id
    const data = await fetch(fakeAPIURL).then((response) => response.json());
    cache.set(id, data);
    console.log(`Post Id ${id} cached`);
})

const post = {
    id: 5,
    title: 'Test Title...',
    body: 'Description...'
}

cache.set("A", post);
cache.set("B", post);

const fetchedPost = cache.get("A");
fetchedPost.title = "New Title";

console.log( "Complex - useClones = " + true + " --- fetchedPost.title: '" 
    + fetchedPost.title + "' != b.title: '" 
    + cache.get("B").title + "'" )

//API Endpoint to demonstrate caching
app.get('/posts/:id', async (req, res) => {
    const id = req.params.id;
    console.log(cache.keys())
    if (cache.has(id)) {
        //Printing the current cache stats
        console.log(cache.getStats());
        console.log('Fetching data from the Node Cache');
        res.send(cache.get(id));
    }
    else {
        const fakeAPIURL = baseURL + id
        const data = await fetch(fakeAPIURL).then((response) => response.json());

        cache.set(req.params.id, data);
        console.log('Fetching Data from the API');
        res.send(data);
    }
})

//Cache Events
cache.on("set", function(key, value) {
    console.log(`New Key ${key} inserted into cache`);
    console.log(cache.keys())
    console.log(cache.getStats())
})

cache.on("del", function(key, value) {
    console.log(`Key ${key} deleted from the cache`);
    console.log(cache.keys())
    console.log(cache.getStats());
})

cache.on("expired", function(key, value) {
    console.log(`Key ${key} expired from the cache`);
    console.log(cache.keys())
    console.log(cache.getStats());
})

//Starting the server
app.listen(3000, () => {
    console.log('The server is listening on port 3000')
})