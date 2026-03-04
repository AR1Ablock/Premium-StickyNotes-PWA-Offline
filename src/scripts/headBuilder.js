import { computed, isRef } from 'vue';

export function buildHead({ title, description, canonical, type = 'website', image, url, jsonLd = null, robots = 'index, follow' }) {
    const read = v => (isRef(v) ? v.value : v);

    return computed(() => {
        const _title = read(title) || 'Sticky Notes App';
        const _description = read(description) || '';
        const _url = read(url) || '';
        const _image = read(image) || '';
        const _canonical = read(canonical) || _url;

        const meta = [
            { name: 'description', content: _description },
            { name: 'keywords', content: 'notes app, sticky notes, markdown editor, offline notes' },
            { name: 'robots', content: robots },
            { property: 'og:site_name', content: 'Sticky Notes App' },
            { property: 'og:type', content: type },
            { property: 'og:title', content: _title },
            { property: 'og:description', content: _description },
            { property: 'og:url', content: _url },
            { property: 'og:image', content: _image },
            { name: 'twitter:card', content: _image ? 'summary_large_image' : 'summary' },
            { name: 'twitter:title', content: _title },
            { name: 'twitter:description', content: _description },
            { name: 'twitter:image', content: _image }
        ].filter(m => m && m.content !== undefined && m.content !== '');

        const link = _canonical ? [
            { rel: 'canonical', href: _canonical },
            { rel: 'icon', href: '/Notes.png' },
            { rel: 'shortcut icon', href: '/Notes.png' }
        ] : [];

        const script = jsonLd ? [{ type: 'application/ld+json', children: JSON.stringify(read(jsonLd)) }] : [];

        return {
            title: _title,
            meta,
            link,
            script
        };
    });
}