export const formatDateToFrench = (date:Date) => {
	return (date.toLocaleString('fr-FR', {
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	}));
};