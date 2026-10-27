<script>
    let {
        src = "../../../../../Application/Sample/Html/images/HaluLogo.png",
        alt = "Haluロゴ",
        className = "img-fluid",
    } = $props();
</script>

<div class="mx-1 mt-1 halu-page-header-icon">
    <img {src} {alt} class={className} />
</div>
