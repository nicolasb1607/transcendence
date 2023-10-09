interface UnlockConditions {
	statKey: string;
	statValue: number;
	OR?: UnlockConditions[];
}

export interface Achievement {
	id: number;
	name: string;
	group?: string;
	description: string;
	image: string;
	//Upgrade achievement
	parent?: number;
	//Define how to unlock the achievement
	unlock?: UnlockConditions;
}