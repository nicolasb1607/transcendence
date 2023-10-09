import React from 'react';

import styles from './ImagePicker.module.css';

const ImagePicker = (props: ImagePickerProps) => {
	const { onImageClick, selectedImage, images, filter, imageBasePath } = props;
	const imageFiltered: UserAvatar[] = (filter !== "all")
		? images.filter(image => image.coalition === filter) : images;

	return (
		<div className={styles.avatarList}>
			{imageFiltered.map((avatar: UserAvatar, index: number) => {
				return (
					<button
						key={index}
						className={styles.imgAvatarDialog}
						onClick={() => onImageClick(avatar.path)}
						data-selected={(selectedImage == avatar.path)}
					>
						<img
							src={imageBasePath + avatar.path}
							alt=""
							width={100}
							height={100}
						/>
					</button>
				)
			})}
		</div>
	);
};

interface ImagePickerProps {
	onImageClick: (imagePath: string) => void;
	selectedImage?: string;
	images: UserAvatar[];
	imageBasePath?: string;
	filter: Coalition | "all";
}

export default ImagePicker;