import React from 'react';
import ImagePicker from '../../../common/imagePicker/ImagePicker';

import groupAvatars from "../../../../data/groupAvatars.json";

const PickAnImage = (props: PickAnImageProps) => {
	const { currentRoom, updateCurrentRoom } = props;
	const imageBasePath = process.env.API_URL + `avatars/` + `public/groupAvatars/`;
	
	const handleImageClick = (imagePath: string) => {
		updateCurrentRoom({image: imagePath});
	}

	return (
		<ImagePicker
			images={groupAvatars}
			onImageClick={handleImageClick}
			selectedImage={currentRoom.image}
			filter="all"
			imageBasePath={imageBasePath}
		/>
	);
};

type PickAnImageProps = BaseManageRoom;

export default PickAnImage;