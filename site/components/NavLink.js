import { createI13nNode } from 'react-i13n';
import { NavLink } from 'fluxible-router';

var I13nNavLink = createI13nNode(NavLink, {
    isLeafNode: true,
    bindClickEvent: true,
    follow: false
});

export default I13nNavLink;
