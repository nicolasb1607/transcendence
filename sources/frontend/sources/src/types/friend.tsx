/* eslint-disable @typescript-eslint/no-unused-vars */
type friendshipStatus = "friend" | "requested" | "requesting" | "blocked" | "none";

interface Friend extends UserDetails {
	friendship?: friendshipStatus;
}