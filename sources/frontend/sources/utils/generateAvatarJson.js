import fs from 'fs';

const buildAvatarJson = (imagesPath, savePath) => {
	fs.readdir(imagesPath, (err, files) => {
		if (err) {
			console.error(err);
			return;
		}

		const json = files.map(f => {
			let coalition = f.split('_')[0];

			if (coalition != "federation" && coalition != "alliance" && coalition != "order" && coalition != "assembly")
				coalition = "all";
			return {	
				coalition: `${coalition}`,
				path: `public/${f}`
			}
		});

		fs.writeFile(savePath, JSON.stringify(json), err => {
			if (err) {
				console.error(err);
				return;
			}
			console.log('avatars.json generated');
		});
	});
}
//build User avatars
buildAvatarJson('../public/avatars/public', '../src/data/avatars.json');
//build Group avatars
buildAvatarJson('../public/avatars/public/groupAvatars', '../src/data/groupAvatars.json')