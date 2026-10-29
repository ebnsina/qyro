<script lang="ts">
	import { file, media } from '#lib/site/links.js';
</script>

<qyro-player src={media.bbb.hls} poster={media.bbb.poster} title={media.bbb.title} thumbnails={file(media.bbb.storyboard)}></qyro-player>
