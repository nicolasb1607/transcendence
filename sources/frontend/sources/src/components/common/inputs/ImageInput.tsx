import React, { useRef } from 'react';

const ImageInput = (props: ImageInputProps) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleChildrenClick = () => {
		if (inputRef.current) {
			inputRef.current.click();
		}
	}

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.item(0);
		props.onClose(file);
	}

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const file = event.dataTransfer?.files?.item(0);
		props.onClose(file);
	};

	return (
		<div
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<input
				onChange={handleInputChange}
				type="file"
				accept="image/png, image/jpeg"
				max={1}
				ref={inputRef}
				style={{ display: 'none' }}
				name='file'
			/>
			{React.cloneElement(props.children, { onClick: handleChildrenClick })}
		</div>
	);
};

interface ImageInputProps {
	children: JSX.Element;
	onClose: (file: File | null | undefined) => void;
}

export default ImageInput;