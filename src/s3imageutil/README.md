# s3imageutil
Helper functions to parse and construction urls, arns, image filenames and s3 keys.

```
npm install
npm run build
npm test
```

Some terms:

key: The unique key referencing the specific image file in s3.
view: The global view referencing the screenshot under consideration. There may be many keys associated with the same view from differen runs, each associated with a different timestamp or branch or developer, etc.