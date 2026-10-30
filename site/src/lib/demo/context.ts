/** What every template's player gets from the playground. Read reactively through getters. */
export interface PlayerContext {
	readonly attrs: Record<string, string | true>;
	readonly captions: boolean;
}
