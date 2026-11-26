import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('dist/data.json','utf8'));
const manifest=JSON.parse(fs.readFileSync('photo-manifest.json','utf8'));
const photos=new Map(manifest.entries.map(p=>[p.id,p]));
let count=0;
for(const laptop of data.laptops){
  const photo=photos.get(laptop.id);
  if(!photo)continue;
  if(!fs.existsSync(`dist/${photo.path}`))throw new Error(`Missing photo: ${photo.path}`);
  Object.assign(laptop,{image:photo.path,imageSourceUrl:photo.sourceUrl,imageUrl:photo.imageUrl,imageNote:photo.note});
  count++;
}
data.photoCoverage={picturedConfigurations:count,totalConfigurations:data.laptops.length,uniqueFiles:new Set(manifest.entries.map(p=>p.path)).size,updatedAt:manifest.updatedAt,rightsNotice:manifest.rightsNotice};
fs.writeFileSync('dist/data.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify(data.photoCoverage));
