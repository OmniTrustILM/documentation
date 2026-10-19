import React from 'react';
import useBrokenLinks from '@docusaurus/useBrokenLinks';

/**
 * A same-page anchor for content that is not a heading, such as a table row a
 * standards mapping links to directly.
 *
 * Docusaurus derives its known anchors from rendered headings and from anchors a
 * page registers explicitly; it cannot see a raw `<a id>` written into Markdown, so
 * a link that targets one is reported broken. Collecting the id here is the same
 * mechanism `ScalarApiReference` uses for API operation fragments, applied to a
 * single anchor instead of a list.
 */
export default function Anchor({id}: {id: string}): React.JSX.Element {
    useBrokenLinks().collectAnchor(id);
    return <a id={id} />;
}
