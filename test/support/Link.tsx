import React, {type AnchorHTMLAttributes} from 'react';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {to?: string};

export default function Link({to, href, ...props}: Props) {
  return <a href={to ?? href} {...props} />;
}
