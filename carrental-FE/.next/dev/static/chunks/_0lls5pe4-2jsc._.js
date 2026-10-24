(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
(()=>{"use strict";return[
"[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    default: null,
    useLinkStatus: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    /**
 * A React component that extends the HTML `<a>` element to provide
 * [prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching)
 * and client-side navigation. This is the primary way to navigate between routes in Next.js.
 *
 * @remarks
 * - Prefetching is only enabled in production.
 *
 * @see https://nextjs.org/docs/app/api-reference/components/link
 */ default: function() {
        return LinkComponent;
    },
    useLinkStatus: function() {
        return useLinkStatus;
    }
});
const _interop_require_wildcard = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-client] (ecmascript)");
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _react = /*#__PURE__*/ _interop_require_wildcard._(__turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"));
const _formaturl = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/router/utils/format-url.js [app-client] (ecmascript)");
const _approutercontextsharedruntime = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/app-router-context.shared-runtime.js [app-client] (ecmascript)");
const _usemergedref = __turbopack_context__.r("[project]/node_modules/next/dist/client/use-merged-ref.js [app-client] (ecmascript)");
const _utils = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils.js [app-client] (ecmascript)");
const _addbasepath = __turbopack_context__.r("[project]/node_modules/next/dist/client/add-base-path.js [app-client] (ecmascript)");
const _routerreducertypes = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/router-reducer/router-reducer-types.js [app-client] (ecmascript)");
const _links = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/links.js [app-client] (ecmascript)");
const _islocalurl = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/router/utils/is-local-url.js [app-client] (ecmascript)");
const _types = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/segment-cache/types.js [app-client] (ecmascript)");
function isModifiedEvent(event) {
    const eventTarget = event.currentTarget;
    const target = eventTarget.getAttribute('target');
    return target && target !== '_self' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || // triggers resource download
    event.nativeEvent && event.nativeEvent.which === 2;
}
function linkClicked(e, href, linkInstanceRef, replace, scroll, onNavigate, transitionTypes, prefetchIntent = 'none') {
    if (typeof window !== 'undefined') {
        const { nodeName } = e.currentTarget;
        // anchors inside an svg have a lowercase nodeName
        const isAnchorNodeName = nodeName.toUpperCase() === 'A';
        if (isAnchorNodeName && isModifiedEvent(e) || e.currentTarget.hasAttribute('download')) {
            // ignore click for browser’s default behavior
            return;
        }
        if (!(0, _islocalurl.isLocalURL)(href)) {
            if (replace) {
                // browser default behavior does not replace the history state
                // so we need to do it manually
                e.preventDefault();
                location.replace(href);
            }
            // ignore click for browser’s default behavior
            return;
        }
        e.preventDefault();
        if (onNavigate) {
            let isDefaultPrevented = false;
            onNavigate({
                preventDefault: ()=>{
                    isDefaultPrevented = true;
                }
            });
            if (isDefaultPrevented) {
                return;
            }
        }
        const { navigate } = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigator.js [app-client] (ecmascript)");
        navigate(href, replace ? 'replace' : 'push', scroll === false ? _routerreducertypes.ScrollBehavior.NoScroll : _routerreducertypes.ScrollBehavior.Default, linkInstanceRef.current, transitionTypes, prefetchIntent);
    }
}
function formatStringOrUrl(urlObjOrString) {
    if (typeof urlObjOrString === 'string') {
        return urlObjOrString;
    }
    return (0, _formaturl.formatUrl)(urlObjOrString);
}
function LinkComponent(props) {
    const [linkStatus, setOptimisticLinkStatus] = (0, _react.useOptimistic)(_links.IDLE_LINK_STATUS);
    let children;
    const linkInstanceRef = (0, _react.useRef)(null);
    const { href: hrefProp, as: asProp, children: childrenProp, prefetch: prefetchProp = null, passHref, replace, shallow, scroll, onClick, onMouseEnter: onMouseEnterProp, onTouchStart: onTouchStartProp, legacyBehavior = false, onNavigate, transitionTypes, ref: forwardedRef, unstable_dynamicOnHover, ...restProps } = props;
    children = childrenProp;
    if (legacyBehavior && (typeof children === 'string' || typeof children === 'number')) {
        children = /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
            children: children
        });
    }
    const router = _react.default.useContext(_approutercontextsharedruntime.AppRouterContext);
    const prefetchEnabled = prefetchProp !== false;
    const prefetchIntent = prefetchProp === false ? 'none' : prefetchProp === true ? 'full' : 'auto';
    const fetchStrategy = prefetchIntent !== 'none' ? getFetchStrategyFromPrefetchIntent(prefetchIntent) : _types.FetchStrategy.PPR;
    if ("TURBOPACK compile-time truthy", 1) {
        function createPropError(args) {
            return new Error(`Failed prop type: The prop \`${args.key}\` expects a ${args.expected} in \`<Link>\`, but got \`${args.actual}\` instead.` + (typeof window !== 'undefined' ? "\nOpen your browser's console to view the Component stack trace." : ''));
        }
        // TypeScript trick for type-guarding:
        const requiredPropsGuard = {
            href: true
        };
        const requiredProps = Object.keys(requiredPropsGuard);
        requiredProps.forEach((key)=>{
            if (key === 'href') {
                if (props[key] == null || typeof props[key] !== 'string' && typeof props[key] !== 'object') {
                    throw createPropError({
                        key,
                        expected: '`string` or `object`',
                        actual: props[key] === null ? 'null' : typeof props[key]
                    });
                }
            } else {
                // TypeScript trick for type-guarding:
                const _ = key;
            }
        });
        // TypeScript trick for type-guarding:
        const optionalPropsGuard = {
            as: true,
            replace: true,
            scroll: true,
            shallow: true,
            passHref: true,
            prefetch: true,
            unstable_dynamicOnHover: true,
            onClick: true,
            onMouseEnter: true,
            onTouchStart: true,
            legacyBehavior: true,
            onNavigate: true,
            transitionTypes: true
        };
        const optionalProps = Object.keys(optionalPropsGuard);
        optionalProps.forEach((key)=>{
            const valType = typeof props[key];
            if (key === 'as') {
                if (props[key] && valType !== 'string' && valType !== 'object') {
                    throw createPropError({
                        key,
                        expected: '`string` or `object`',
                        actual: valType
                    });
                }
            } else if (key === 'onClick' || key === 'onMouseEnter' || key === 'onTouchStart' || key === 'onNavigate') {
                if (props[key] && valType !== 'function') {
                    throw createPropError({
                        key,
                        expected: '`function`',
                        actual: valType
                    });
                }
            } else if (key === 'replace' || key === 'scroll' || key === 'shallow' || key === 'passHref' || key === 'legacyBehavior' || key === 'unstable_dynamicOnHover') {
                if (props[key] != null && valType !== 'boolean') {
                    throw createPropError({
                        key,
                        expected: '`boolean`',
                        actual: valType
                    });
                }
            } else if (key === 'prefetch') {
                if (props[key] != null && valType !== 'boolean' && props[key] !== 'auto') {
                    throw createPropError({
                        key,
                        expected: '`boolean | "auto"`',
                        actual: valType
                    });
                }
            } else if (key === 'transitionTypes') {
                if (props[key] != null && !Array.isArray(props[key])) {
                    throw createPropError({
                        key,
                        expected: '`string[]`',
                        actual: valType
                    });
                }
            } else {
                // TypeScript trick for type-guarding:
                const _ = key;
            }
        });
    }
    const resolvedHref = asProp || hrefProp;
    const formattedHref = formatStringOrUrl(resolvedHref);
    if ("TURBOPACK compile-time truthy", 1) {
        const { warnOnce } = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils/warn-once.js [app-client] (ecmascript)");
        if (props.locale) {
            warnOnce('The `locale` prop is not supported in `next/link` while using the `app` router. Read more about app router internalization: https://nextjs.org/docs/app/building-your-application/routing/internationalization');
        }
        if (!asProp) {
            let href;
            if (typeof resolvedHref === 'string') {
                href = resolvedHref;
            } else if (typeof resolvedHref === 'object' && typeof resolvedHref.pathname === 'string') {
                href = resolvedHref.pathname;
            }
            if (href) {
                const hasDynamicSegment = href.split('/').some((segment)=>segment.startsWith('[') && segment.endsWith(']'));
                if (hasDynamicSegment) {
                    throw new Error(`Dynamic href \`${href}\` found in <Link> while using the \`/app\` router, this is not supported. Read more: https://nextjs.org/docs/messages/app-dir-dynamic-href`);
                }
            }
        }
    }
    // This will return the first child, if multiple are provided it will throw an error
    let child;
    if (legacyBehavior) {
        if (children?.$$typeof === Symbol.for('react.lazy')) {
            throw new Error(`\`<Link legacyBehavior>\` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's \`<a>\` tag.`);
        }
        if ("TURBOPACK compile-time truthy", 1) {
            if (onClick) {
                console.warn(`"onClick" was passed to <Link> with \`href\` of \`${formattedHref}\` but "legacyBehavior" was set. The legacy behavior requires onClick be set on the child of next/link`);
            }
            if (onMouseEnterProp) {
                console.warn(`"onMouseEnter" was passed to <Link> with \`href\` of \`${formattedHref}\` but "legacyBehavior" was set. The legacy behavior requires onMouseEnter be set on the child of next/link`);
            }
            try {
                child = _react.default.Children.only(children);
            } catch (err) {
                if (!children) {
                    throw new Error(`No children were passed to <Link> with \`href\` of \`${formattedHref}\` but one child is required https://nextjs.org/docs/messages/link-no-children`);
                }
                throw new Error(`Multiple children were passed to <Link> with \`href\` of \`${formattedHref}\` but only one child is supported https://nextjs.org/docs/messages/link-multiple-children` + (typeof window !== 'undefined' ? " \nOpen your browser's console to view the Component stack trace." : ''));
            }
        } else //TURBOPACK unreachable
        ;
    } else {
        if ("TURBOPACK compile-time truthy", 1) {
            if (children?.type === 'a') {
                throw new Error('Invalid <Link> with <a> child. Please remove <a> or use <Link legacyBehavior>.\nLearn more: https://nextjs.org/docs/messages/invalid-new-link-with-extra-anchor');
            }
        }
    }
    const childRef = legacyBehavior ? child && typeof child === 'object' && child.ref : forwardedRef;
    // Capture the Owner Stack during render so dev-only warnings emitted later
    // at navigation time can be associated with the JSX that created
    // this <Link>.
    const ownerStack = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : undefined;
    // Use a callback ref to attach an IntersectionObserver to the anchor tag on
    // mount. In the future we will also use this to keep track of all the
    // currently mounted <Link> instances, e.g. so we can re-prefetch them after
    // a revalidation or refresh.
    const observeLinkVisibilityOnMount = _react.default.useCallback({
        "LinkComponent.useCallback[observeLinkVisibilityOnMount]": (element)=>{
            if (router !== null) {
                linkInstanceRef.current = (0, _links.mountLinkInstance)(element, formattedHref, router, fetchStrategy, prefetchEnabled, setOptimisticLinkStatus, ownerStack);
            }
            return ({
                "LinkComponent.useCallback[observeLinkVisibilityOnMount]": ()=>{
                    if (linkInstanceRef.current) {
                        (0, _links.unmountLinkForCurrentNavigation)(linkInstanceRef.current);
                        linkInstanceRef.current = null;
                    }
                    (0, _links.unmountPrefetchableInstance)(element);
                }
            })["LinkComponent.useCallback[observeLinkVisibilityOnMount]"];
        }
    }["LinkComponent.useCallback[observeLinkVisibilityOnMount]"], [
        prefetchEnabled,
        formattedHref,
        router,
        fetchStrategy,
        setOptimisticLinkStatus,
        ownerStack
    ]);
    const mergedRef = (0, _usemergedref.useMergedRef)(observeLinkVisibilityOnMount, childRef);
    const childProps = {
        ref: mergedRef,
        onClick (e) {
            if ("TURBOPACK compile-time truthy", 1) {
                if (!e) {
                    throw new Error(`Component rendered inside next/link has to pass click event to "onClick" prop.`);
                }
            }
            if (!legacyBehavior && typeof onClick === 'function') {
                onClick(e);
            }
            if (legacyBehavior && child.props && typeof child.props.onClick === 'function') {
                child.props.onClick(e);
            }
            if (!router) {
                return;
            }
            if (e.defaultPrevented) {
                return;
            }
            linkClicked(e, formattedHref, linkInstanceRef, replace, scroll, onNavigate, transitionTypes, prefetchIntent);
        },
        onMouseEnter (e) {
            if (!legacyBehavior && typeof onMouseEnterProp === 'function') {
                onMouseEnterProp(e);
            }
            if (legacyBehavior && child.props && typeof child.props.onMouseEnter === 'function') {
                child.props.onMouseEnter(e);
            }
            if (!router) {
                return;
            }
            if ("TURBOPACK compile-time truthy", 1) {
                return;
            }
            //TURBOPACK unreachable
            ;
            const upgradeToDynamicPrefetch = undefined;
        },
        onTouchStart: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : function onTouchStart(e) {
            if (!legacyBehavior && typeof onTouchStartProp === 'function') {
                onTouchStartProp(e);
            }
            if (legacyBehavior && child.props && typeof child.props.onTouchStart === 'function') {
                child.props.onTouchStart(e);
            }
            if (!router) {
                return;
            }
            if (!prefetchEnabled) {
                return;
            }
            const upgradeToDynamicPrefetch = unstable_dynamicOnHover === true;
            (0, _links.onNavigationIntent)(e.currentTarget, upgradeToDynamicPrefetch);
        }
    };
    // If the url is absolute, we can bypass the logic to prepend the basePath.
    if ((0, _utils.isAbsoluteUrl)(formattedHref)) {
        childProps.href = formattedHref;
    } else if (!legacyBehavior || passHref || child.type === 'a' && !('href' in child.props)) {
        childProps.href = (0, _addbasepath.addBasePath)(formattedHref);
    }
    let link;
    if (legacyBehavior) {
        if ("TURBOPACK compile-time truthy", 1) {
            const { errorOnce } = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils/error-once.js [app-client] (ecmascript)");
            errorOnce('`legacyBehavior` is deprecated and will be removed in a future ' + 'release. A codemod is available to upgrade your components:\n\n' + 'npx @next/codemod@latest new-link .\n\n' + 'Learn more: https://nextjs.org/docs/app/building-your-application/upgrading/codemods#remove-a-tags-from-link-components');
        }
        link = /*#__PURE__*/ _react.default.cloneElement(child, childProps);
    } else {
        link = /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
            ...restProps,
            ...childProps,
            children: children
        });
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(LinkStatusContext.Provider, {
        value: linkStatus,
        children: link
    });
}
const LinkStatusContext = /*#__PURE__*/ (0, _react.createContext)(_links.IDLE_LINK_STATUS);
const useLinkStatus = ()=>{
    return (0, _react.useContext)(LinkStatusContext);
};
function getFetchStrategyFromPrefetchIntent(prefetchIntent) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        return prefetchIntent === 'auto' ? _types.FetchStrategy.PPR : _types.FetchStrategy.Full;
    }
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/components/bfcache-state-manager.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useRouterBFCache", {
    enumerable: true,
    get: function() {
        return useRouterBFCache;
    }
});
const _react = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
// When the flag is disabled, only track the currently active tree
const MAX_BF_CACHE_ENTRIES = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 1;
function useRouterBFCache(activeTree, activeRenderTree, activeStateKey) {
    // The currently active entry. The entries form a linked list, sorted in
    // order of most recently active. This allows us to reuse parts of the list
    // without cloning, unless there's a reordering or removal.
    // TODO: Once we start tracking back/forward history at each route level,
    // we should use the history order instead. In other words, when traversing
    // to an existing entry as a result of a popstate event, we should maintain
    // the existing order instead of moving it to the front of the list. I think
    // an initial implementation of this could be to pass an incrementing id
    // to history.pushState/replaceState, then use that here for ordering.
    const [prevActiveEntry, setPrevActiveEntry] = (0, _react.useState)(()=>{
        const initialEntry = {
            tree: activeTree,
            renderTree: activeRenderTree,
            stateKey: activeStateKey,
            next: null
        };
        return initialEntry;
    });
    if (prevActiveEntry.tree === activeTree) {
        // Fast path. The active tree hasn't changed, so we can reuse the
        // existing state.
        return prevActiveEntry;
    }
    // The route tree changed. Note that this doesn't mean that the tree changed
    // *at this level* — the change may be due to a child route. Either way, we
    // need to either add or update the router tree in the bfcache.
    //
    // The rest of the code looks more complicated than it actually is because we
    // can't mutate the state in place; we have to copy-on-write.
    // Create a new entry for the active cache key. This is the head of the new
    // linked list.
    const newActiveEntry = {
        tree: activeTree,
        renderTree: activeRenderTree,
        stateKey: activeStateKey,
        next: null
    };
    // We need to append the old list onto the new list. If the head of the new
    // list was already present in the cache, then we'll need to clone everything
    // that came before it. Then we can reuse the rest.
    let n = 1;
    let oldEntry = prevActiveEntry;
    let clonedEntry = newActiveEntry;
    while(oldEntry !== null && n < MAX_BF_CACHE_ENTRIES){
        if (oldEntry.stateKey === activeStateKey) {
            // Fast path. This entry in the old list that corresponds to the key that
            // is now active. We've already placed a clone of this entry at the front
            // of the new list. We can reuse the rest of the old list without cloning.
            // NOTE: We don't need to worry about eviction in this case because we
            // haven't increased the size of the cache, and we assume the max size
            // is constant across renders. If we were to change it to a dynamic limit,
            // then the implementation would need to account for that.
            clonedEntry.next = oldEntry.next;
            break;
        } else {
            // Clone the entry and append it to the list.
            n++;
            const entry = {
                tree: oldEntry.tree,
                renderTree: oldEntry.renderTree,
                stateKey: oldEntry.stateKey,
                next: null
            };
            clonedEntry.next = entry;
            clonedEntry = entry;
        }
        oldEntry = oldEntry.next;
    }
    setPrevActiveEntry(newActiveEntry);
    return newActiveEntry;
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/components/client-boundary-params.browser.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// Browser variant of `./client-boundary-params`. In the browser the params and
// searchParams are created at render time rather than dynamically tracked.
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    createClientParams: null,
    createClientSearchParams: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createClientParams: function() {
        return _paramsbrowser.createRenderParamsFromClient;
    },
    createClientSearchParams: function() {
        return _searchparamsbrowser.createRenderSearchParamsFromClient;
    }
});
const _paramsbrowser = __turbopack_context__.r("[project]/node_modules/next/dist/client/request/params.browser.js [app-client] (ecmascript)");
const _searchparamsbrowser = __turbopack_context__.r("[project]/node_modules/next/dist/client/request/search-params.browser.js [app-client] (ecmascript)");
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/components/client-page.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClientPageRoot", {
    enumerable: true,
    get: function() {
        return ClientPageRoot;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _approutercontextsharedruntime = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/app-router-context.shared-runtime.js [app-client] (ecmascript)");
const _react = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
const _routeparams = __turbopack_context__.r("[project]/node_modules/next/dist/client/route-params.js [app-client] (ecmascript)");
const _hooksclientcontextsharedruntime = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/hooks-client-context.shared-runtime.js [app-client] (ecmascript)");
const _clientboundaryparams = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/client-boundary-params.browser.js [app-client] (ecmascript)");
function ClientPageRoot({ Component, serverProvidedParams }) {
    let searchParams;
    let params;
    if (serverProvidedParams !== null) {
        searchParams = serverProvidedParams.searchParams;
        params = serverProvidedParams.params;
    } else {
        // When Cache Components is enabled, the server does not pass the params as
        // props; they are parsed on the client and passed via context.
        const layoutRouterContext = (0, _react.use)(_approutercontextsharedruntime.LayoutRouterContext);
        params = layoutRouterContext !== null ? layoutRouterContext.parentParams : {};
        // This is an intentional behavior change: when Cache Components is enabled,
        // client segments receive the "canonical" search params, not the
        // rewritten ones. Users should either call useSearchParams directly or pass
        // the rewritten ones in from a Server Component.
        // TODO: Log a deprecation error when this object is accessed
        searchParams = (0, _routeparams.urlSearchParamsToParsedUrlQuery)((0, _react.use)(_hooksclientcontextsharedruntime.SearchParamsContext));
    }
    const clientSearchParams = (0, _clientboundaryparams.createClientSearchParams)(searchParams);
    const clientParams = (0, _clientboundaryparams.createClientParams)(params);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(Component, {
        params: clientParams,
        searchParams: clientSearchParams
    });
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/components/client-segment.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClientSegmentRoot", {
    enumerable: true,
    get: function() {
        return ClientSegmentRoot;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _approutercontextsharedruntime = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/app-router-context.shared-runtime.js [app-client] (ecmascript)");
const _react = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
const _clientboundaryparams = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/client-boundary-params.browser.js [app-client] (ecmascript)");
function ClientSegmentRoot({ Component, slots, serverProvidedParams }) {
    let params;
    if (serverProvidedParams !== null) {
        params = serverProvidedParams.params;
    } else {
        // When Cache Components is enabled, the server does not pass the params
        // as props; they are parsed on the client and passed via context.
        const layoutRouterContext = (0, _react.use)(_approutercontextsharedruntime.LayoutRouterContext);
        params = layoutRouterContext !== null ? layoutRouterContext.parentParams : {};
    }
    const clientParams = (0, _clientboundaryparams.createClientParams)(params);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(Component, {
        ...slots,
        params: clientParams
    });
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/components/instant-validation/boundary.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    InstantValidationBoundaryContext: null,
    PlaceValidationBoundaryBelowThisLevel: null,
    RenderValidationBoundaryAtThisLevel: null,
    SlotMarker: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    InstantValidationBoundaryContext: function() {
        return _impl.InstantValidationBoundaryContext;
    },
    PlaceValidationBoundaryBelowThisLevel: function() {
        return _impl.PlaceValidationBoundaryBelowThisLevel;
    },
    RenderValidationBoundaryAtThisLevel: function() {
        return _impl.RenderValidationBoundaryAtThisLevel;
    },
    SlotMarker: function() {
        return _impl.SlotMarker;
    }
});
const _impl = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/instant-validation/impl.browser.js [app-client] (ecmascript)");
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/components/instant-validation/impl.browser.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    InstantValidationBoundaryContext: null,
    PlaceValidationBoundaryBelowThisLevel: null,
    RenderValidationBoundaryAtThisLevel: null,
    SlotMarker: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    InstantValidationBoundaryContext: function() {
        return InstantValidationBoundaryContext;
    },
    PlaceValidationBoundaryBelowThisLevel: function() {
        return PlaceValidationBoundaryBelowThisLevel;
    },
    RenderValidationBoundaryAtThisLevel: function() {
        return RenderValidationBoundaryAtThisLevel;
    },
    SlotMarker: function() {
        return SlotMarker;
    }
});
const InstantValidationBoundaryContext = null;
const PlaceValidationBoundaryBelowThisLevel = null;
const RenderValidationBoundaryAtThisLevel = null;
const SlotMarker = null;
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/components/layout-router.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    LoadingBoundaryProvider: null,
    default: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    LoadingBoundaryProvider: function() {
        return LoadingBoundaryProvider;
    },
    /**
 * OuterLayoutRouter handles the current segment as well as <Offscreen> rendering of other segments.
 * It can be rendered next to each other with a different `parallelRouterKey`, allowing for Parallel routes.
 */ default: function() {
        return OuterLayoutRouter;
    }
});
const _interop_require_wildcard = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-client] (ecmascript)");
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _react = /*#__PURE__*/ _interop_require_wildcard._(__turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"));
const _approutercontextsharedruntime = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/app-router-context.shared-runtime.js [app-client] (ecmascript)");
const _unresolvedthenable = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/unresolved-thenable.js [app-client] (ecmascript)");
const _errorboundary = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/error-boundary.js [app-client] (ecmascript)");
const _disablesmoothscroll = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/router/utils/disable-smooth-scroll.js [app-client] (ecmascript)");
const _redirectboundary = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/redirect-boundary.js [app-client] (ecmascript)");
const _errorboundary1 = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/http-access-fallback/error-boundary.js [app-client] (ecmascript)");
const _boundary = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/instant-validation/boundary.js [app-client] (ecmascript)");
const _createsegmentkey = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/router-reducer/create-segment-key.browser.js [app-client] (ecmascript)");
const _bfcachestatemanager = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/bfcache-state-manager.js [app-client] (ecmascript)");
const _apppaths = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/router/utils/app-paths.js [app-client] (ecmascript)");
const _hooksclientcontextsharedruntime = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/hooks-client-context.shared-runtime.js [app-client] (ecmascript)");
const _routeparams = __turbopack_context__.r("[project]/node_modules/next/dist/client/route-params.js [app-client] (ecmascript)");
const _rendertree = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/render-tree.js [app-client] (ecmascript)");
/**
 * Resolve the root scroll padding used by the viewport check.
 *
 * Computed lengths serialize as pixels, but percentages remain relative to
 * the scrollport. Preserve the existing behavior for values that still
 * contain unresolved CSS math.
 */ function getScrollPaddingTopInPixels(htmlElement, viewportHeight) {
    const scrollPaddingTop = getComputedStyle(htmlElement).scrollPaddingTop;
    const value = Number.parseFloat(scrollPaddingTop);
    if (!Number.isFinite(value) || value < 0) {
        return 0;
    }
    if (scrollPaddingTop.endsWith('px')) {
        return value;
    }
    if (scrollPaddingTop.endsWith('%')) {
        return value / 100 * viewportHeight;
    }
    return 0;
}
/**
 * Check where the top corner of the HTMLElement is relative to the usable
 * viewport.
 *
 * Scroll padding is resolved lazily so an empty Fragment does not trigger a
 * computed style read. The caller caches the value for the second check.
 */ function getScrollTargetState(instance, viewportHeight, getScrollPaddingTop) {
    const rects = instance.getClientRects();
    if (rects.length === 0) {
        return 0;
    }
    let elementTop = Number.POSITIVE_INFINITY;
    for(let i = 0; i < rects.length; i++){
        const rect = rects[i];
        if (rect.top < elementTop) {
            elementTop = rect.top;
        }
    }
    return elementTop >= getScrollPaddingTop() && elementTop <= viewportHeight ? 1 : 2;
}
/**
 * Find the DOM node for a hash fragment.
 * If `top` the page has to scroll to the top of the page. This mirrors the browser's behavior.
 * If the hash fragment is an id, the page has to scroll to the element with that id.
 * If the hash fragment is a name, the page has to scroll to the first element with that name.
 */ function getHashFragmentDomNode(hashFragment) {
    // If the hash fragment is `top` the page has to scroll to the top of the page.
    if (hashFragment === 'top') {
        return document.body;
    }
    // If the hash fragment is an id, the page has to scroll to the element with that id.
    return document.getElementById(hashFragment) ?? // If the hash fragment is a name, the page has to scroll to the first element with that name.
    document.getElementsByName(hashFragment)[0] ?? null;
}
/**
 * Uses Fragment refs for scrolling.
 * Does not focus the first host descendant.
 */ function InnerScrollHandler(props) {
    const childrenRef = _react.default.useRef(null);
    (0, _react.useLayoutEffect)(()=>{
        const { scrollRef: scrollHandlerRef, renderTree } = props;
        const scrollRef = scrollHandlerRef.forceScroll ? scrollHandlerRef.scrollRef : renderTree.data.scrollRef;
        if (scrollRef === null || !scrollRef.current) return;
        let instance = null;
        const hashFragment = scrollHandlerRef.hashFragment;
        if (hashFragment) {
            instance = getHashFragmentDomNode(hashFragment);
            if (instance === null) {
                // A missing hash target is still a handled scroll intent. Do not
                // fall back to the route Fragment or leave the intent pending.
                scrollRef.current = false;
                scrollHandlerRef.onlyHashChange = false;
                scrollHandlerRef.hashFragment = null;
                return;
            }
        } else {
            instance = childrenRef.current;
        }
        // If there is no DOM node this layout-router level is skipped. It'll be handled higher-up in the tree.
        if (instance === null) {
            return;
        }
        let didHandleScroll = false;
        (0, _disablesmoothscroll.disableSmoothScrollDuringRouteTransition)(()=>{
            const htmlElement = document.documentElement;
            let viewportHeight = null;
            let initialTargetState = null;
            let scrollPaddingTop = null;
            const getScrollPaddingTop = ()=>{
                if (scrollPaddingTop === null) {
                    // Reuse the style and layout update from the geometry read.
                    scrollPaddingTop = getScrollPaddingTopInPixels(htmlElement, viewportHeight);
                }
                return scrollPaddingTop;
            };
            if (!hashFragment) {
                // Store the current viewport height because reading `clientHeight` causes a reflow,
                // and it won't change during this function.
                viewportHeight = htmlElement.clientHeight;
                initialTargetState = getScrollTargetState(instance, viewportHeight, getScrollPaddingTop);
                // An empty Fragment is not a scroll target. In particular, avoid
                // React's sibling fallback and leave the scroll signal available
                // for another changed segment.
                if (initialTargetState === 0) {
                    return;
                }
            }
            didHandleScroll = true;
            // Mark as scrolled so no other segment scrolls for this navigation.
            scrollRef.current = false;
            // This handler intentionally leaves focus untouched; resetting focus on
            // navigation is deferred.
            // In case of hash scroll, we only need to scroll the element into view
            if (hashFragment) {
                instance.scrollIntoView();
                return;
            }
            // If the element's top edge is already in the viewport, exit early.
            if (initialTargetState === 1) {
                return;
            }
            // Otherwise, try scrolling go the top of the document to be backward compatible with pages
            // scrollIntoView() called on `<html/>` element scrolls horizontally on chrome and firefox (that shouldn't happen)
            // We could use it to scroll horizontally following RTL but that also seems to be broken - it will always scroll left
            // scrollLeft = 0 also seems to ignore RTL and manually checking for RTL is too much hassle so we will scroll just vertically
            htmlElement.scrollTop = 0;
            // Scroll to domNode if domNode is not in viewport when scrolled to top of document
            if (getScrollTargetState(instance, viewportHeight, getScrollPaddingTop) === 2) {
                // Scroll into view doesn't scroll horizontally by default when not needed
                instance.scrollIntoView();
            }
        }, {
            // We will force layout by querying domNode position
            dontForceLayout: true,
            onlyHashChange: scrollHandlerRef.onlyHashChange
        });
        if (!didHandleScroll) {
            return;
        }
        // Mutate after scrolling so that it can be read by `disableSmoothScrollDuringRouteTransition`
        scrollHandlerRef.onlyHashChange = false;
        scrollHandlerRef.hashFragment = null;
    }, // but be prepared for lots of manual testing.
    undefined);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_react.Fragment, {
        ref: childrenRef,
        children: props.children
    });
}
function ScrollHandler({ children, renderTree }) {
    const context = (0, _react.useContext)(_approutercontextsharedruntime.GlobalLayoutRouterContext);
    if (!context) {
        throw new Error('invariant global layout router not mounted');
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(InnerScrollHandler, {
        scrollRef: context.scrollRef,
        renderTree: renderTree,
        children: children
    });
}
/**
 * InnerLayoutRouter handles rendering the provided segment based on the cache.
 */ function InnerLayoutRouter({ tree, segmentPath, debugNameContext, renderTree, params, url, isActive }) {
    const context = (0, _react.useContext)(_approutercontextsharedruntime.GlobalLayoutRouterContext);
    const parentNavPromises = (0, _react.useContext)(_hooksclientcontextsharedruntime.NavigationPromisesContext);
    if (!context) {
        throw new Error('invariant global layout router not mounted');
    }
    // `rsc` represents the renderable node for this segment.
    // If this segment has a `prefetchRsc`, it's the statically prefetched data.
    // We should use that on initial render instead of `rsc`. Then we'll switch
    // to `rsc` when the dynamic response streams in.
    //
    // If no prefetch data is available, then we go straight to rendering `rsc`.
    const resolvedPrefetchRsc = renderTree.data.prefetchRsc !== null ? renderTree.data.prefetchRsc : renderTree.data.rsc;
    // We use `useDeferredValue` to handle switching between the prefetched and
    // final values. The second argument is returned on initial render, then it
    // re-renders with the first argument.
    const rsc = (0, _react.useDeferredValue)(renderTree.data.rsc, resolvedPrefetchRsc);
    // `rsc` is either a React node or a promise for a React node, except we
    // special case `null` to represent that this segment's data is missing. If
    // it's a promise, we need to unwrap it so we can determine whether or not the
    // data is missing.
    let resolvedRsc;
    if ((0, _rendertree.isDeferredRsc)(rsc)) {
        const unwrappedRsc = (0, _react.use)(rsc);
        if (unwrappedRsc === null) {
            // If the promise was resolved to `null`, it means the data for this
            // segment was not returned by the server. Suspend indefinitely. When this
            // happens, the router is responsible for triggering a new state update to
            // un-suspend this segment.
            (0, _react.use)(_unresolvedthenable.unresolvedThenable);
        }
        resolvedRsc = unwrappedRsc;
    } else {
        // This is not a deferred RSC promise. Don't need to unwrap it.
        if (rsc === null) {
            (0, _react.use)(_unresolvedthenable.unresolvedThenable);
        }
        resolvedRsc = rsc;
    }
    // In dev, we create a NavigationPromisesContext containing the instrumented promises that provide
    // `useSelectedLayoutSegment` and `useSelectedLayoutSegments`.
    // Promises are cached outside of render to survive suspense retries.
    let navigationPromises = null;
    if ("TURBOPACK compile-time truthy", 1) {
        const { createNestedLayoutNavigationPromises } = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation-devtools.js [app-client] (ecmascript)");
        navigationPromises = createNestedLayoutNavigationPromises(tree, parentNavPromises);
    }
    let children = resolvedRsc;
    if (navigationPromises) {
        children = /*#__PURE__*/ (0, _jsxruntime.jsx)(_hooksclientcontextsharedruntime.NavigationPromisesContext.Provider, {
            value: navigationPromises,
            children: resolvedRsc
        });
    }
    children = /*#__PURE__*/ (0, _jsxruntime.jsx)(_approutercontextsharedruntime.LayoutRouterContext.Provider, {
        value: {
            parentTree: tree,
            parentRenderTree: renderTree,
            parentSegmentPath: segmentPath,
            parentParams: params,
            // This is always set to null as we enter a child segment. It's
            // populated by LoadingBoundaryProvider the next time we reach a
            // loading boundary.
            parentLoadingData: null,
            debugNameContext: debugNameContext,
            // TODO-APP: overriding of url for parallel routes
            url: url,
            isActive: isActive
        },
        children: children
    });
    return children;
}
function LoadingBoundaryProvider({ loading, children }) {
    // Provides the data needed to render a loading.tsx boundary, via context.
    //
    // loading.tsx creates a Suspense boundary around each of a layout's child
    // slots. (Might be bit confusing to think about the data flow, but: if
    // loading.tsx and layout.tsx are in the same directory, they are assigned
    // to the same render tree.)
    //
    // This provider component does not render the Suspense boundary directly;
    // that's handled by LoadingBoundary.
    //
    // TODO: For simplicity, we should combine this provider with LoadingBoundary
    // and render the Suspense boundary directly. The only real benefit of doing
    // it separately is so that when there are multiple parallel routes, we only
    // send the boundary data once, rather than once per child. But that's a
    // negligible benefit and can be achieved via caching instead.
    const parentContext = (0, _react.use)(_approutercontextsharedruntime.LayoutRouterContext);
    if (parentContext === null) {
        return children;
    }
    // All values except for parentLoadingData are the same as the parent context.
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_approutercontextsharedruntime.LayoutRouterContext.Provider, {
        value: {
            parentTree: parentContext.parentTree,
            parentRenderTree: parentContext.parentRenderTree,
            parentSegmentPath: parentContext.parentSegmentPath,
            parentParams: parentContext.parentParams,
            parentLoadingData: loading,
            debugNameContext: parentContext.debugNameContext,
            url: parentContext.url,
            isActive: parentContext.isActive
        },
        children: children
    });
}
/**
 * Renders suspense boundary with the provided "loading" property as the fallback.
 * If no loading property is provided it renders the children without a suspense boundary.
 */ function LoadingBoundary({ name, loading, children }) {
    // TODO: For LoadingBoundary, and the other built-in boundary types, don't
    // wrap in an extra function component if no user-defined boundary is
    // provided. In other words, inline this conditional wrapping logic into
    // the parent component. More efficient and keeps unnecessary junk out of
    // the component stack.
    if (loading !== null) {
        const loadingRsc = loading[0];
        const loadingStyles = loading[1];
        const loadingScripts = loading[2];
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(_react.Suspense, {
            name: name,
            fallback: /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
                children: [
                    loadingStyles,
                    loadingScripts,
                    loadingRsc
                ]
            }),
            children: children
        });
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
        children: children
    });
}
function OuterLayoutRouter({ parallelRouterKey, error, errorStyles, errorScripts, templateStyles, templateScripts, template, notFound, forbidden, unauthorized, segmentViewBoundaries }) {
    const context = (0, _react.useContext)(_approutercontextsharedruntime.LayoutRouterContext);
    if (!context) {
        throw new Error('invariant expected layout router to be mounted');
    }
    const { parentTree, parentRenderTree, parentSegmentPath, parentParams, parentLoadingData, url, isActive, debugNameContext } = context;
    // Get the render tree for this segment by reading it from the parent segment's
    // child map.
    const parentTreeSegment = parentTree[0];
    const segmentPath = parentSegmentPath === null ? // the code. We should clean this up.
    [
        parallelRouterKey
    ] : parentSegmentPath.concat([
        parentTreeSegment,
        parallelRouterKey
    ]);
    // The "state" key of a segment is the one passed to React. In the browser it
    // represents the identity of the UI tree. Whenever the state key changes,
    // the tree is recreated and the state is reset. In the App Router model,
    // search params do not cause state to be lost, so two segments with the same
    // segment path but different search params should have the same state key.
    // On the server, the key describes the segment's structure instead, so it
    // stays the same when unknown params become known during HTML resume.
    //
    // Whether the data can be reused is tracked separately, by the segment
    // cache's vary paths.
    const activeTree = parentTree[1][parallelRouterKey];
    const activeRenderTree = parentRenderTree.slots?.get(parallelRouterKey);
    if (activeTree === undefined || activeRenderTree === undefined) {
        // Could not find a matching segment. The client tree is inconsistent with
        // the server tree. Suspend indefinitely; the router will have already
        // detected the inconsistency when handling the server response, and
        // triggered a refresh of the page to recover.
        (0, _react.use)(_unresolvedthenable.unresolvedThenable);
    }
    let maybeValidationBoundaryId = null;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const activeSegment = activeTree[0];
    const activeStateKey = (0, _createsegmentkey.createSegmentKey)(activeSegment);
    // At each level of the route tree, not only do we render the currently
    // active segment — we also render the last N segments that were active at
    // this level inside a hidden <Activity> boundary, to preserve their state
    // if or when the user navigates to them again.
    //
    // bfcacheEntry is a linked list of FlightRouterStates.
    let bfcacheEntry = (0, _bfcachestatemanager.useRouterBFCache)(activeTree, activeRenderTree, activeStateKey);
    let children = [];
    do {
        const tree = bfcacheEntry.tree;
        const renderTree = bfcacheEntry.renderTree;
        const stateKey = bfcacheEntry.stateKey;
        const segment = tree[0];
        /*
    - Error boundary
      - Only renders error boundary if error component is provided.
      - Rendered for each segment to ensure they have their own error state.
      - When gracefully degrade for bots, skip rendering error boundary.
    - Loading boundary
      - Only renders suspense boundary if loading components is provided.
      - Rendered for each segment to ensure they have their own loading state.
      - Passed to the router during rendering to ensure it can be immediately rendered when suspending on a Flight fetch.
  */ let segmentBoundaryTriggerNode = null;
        let segmentViewStateNode = null;
        if ("TURBOPACK compile-time truthy", 1) {
            const { SegmentBoundaryTriggerNode, SegmentViewStateNode } = __turbopack_context__.r("[project]/node_modules/next/dist/next-devtools/userspace/app/segment-explorer-node.js [app-client] (ecmascript)");
            const pagePrefix = (0, _apppaths.normalizeAppPath)(url);
            segmentViewStateNode = /*#__PURE__*/ (0, _jsxruntime.jsx)(SegmentViewStateNode, {
                page: pagePrefix
            }, pagePrefix);
            segmentBoundaryTriggerNode = /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
                children: /*#__PURE__*/ (0, _jsxruntime.jsx)(SegmentBoundaryTriggerNode, {})
            });
        }
        let params = parentParams;
        if (Array.isArray(segment)) {
            // This segment contains a route param. Accumulate these as we traverse
            // down the router tree. The result represents the set of params that
            // the layout/page components are permitted to access below this point.
            const paramName = segment[0];
            const paramCacheKey = segment[1];
            const paramType = segment[2];
            const paramValue = (0, _routeparams.getParamValueFromCacheKey)(paramCacheKey, paramType);
            if (paramValue !== null) {
                params = {
                    ...parentParams,
                    [paramName]: paramValue
                };
            }
        }
        const debugName = getBoundaryDebugNameFromSegment(segment);
        // `debugNameContext` represents the nearest non-"virtual" parent segment.
        // `getBoundaryDebugNameFromSegment` returns undefined for virtual segments.
        // So if `debugName` is undefined, the context is passed through unchanged.
        const childDebugNameContext = debugName ?? debugNameContext;
        // In practical terms, clicking this name in the Suspense DevTools
        // should select the child slots of that layout.
        //
        // So the name we apply to the Activity boundary is actually based on
        // the nearest parent segments.
        //
        // We skip over "virtual" parents, i.e. ones inserted by Next.js that
        // don't correspond to application-defined code.
        const isVirtual = debugName === undefined;
        const debugNameToDisplay = isVirtual ? undefined : debugNameContext;
        let templateValue = /*#__PURE__*/ (0, _jsxruntime.jsxs)(ScrollHandler, {
            renderTree: renderTree,
            children: [
                /*#__PURE__*/ (0, _jsxruntime.jsx)(_errorboundary.ErrorBoundary, {
                    errorComponent: error,
                    errorStyles: errorStyles,
                    errorScripts: errorScripts,
                    children: /*#__PURE__*/ (0, _jsxruntime.jsx)(LoadingBoundary, {
                        name: debugNameToDisplay,
                        // TODO: The loading module data for a segment is stored on the
                        // parent, then applied to each of that parent segment's
                        // parallel route slots. In the simple case where there's only
                        // one parallel route (the `children` slot), this is no
                        // different from if the loading module data were stored on the
                        // child directly. But I'm not sure this actually makes sense
                        // when there are multiple parallel routes. It's not a huge
                        // issue because you always have the option to define a narrower
                        // loading boundary for a particular slot. But this sort of
                        // smells like an implementation accident to me.
                        loading: parentLoadingData,
                        children: /*#__PURE__*/ (0, _jsxruntime.jsx)(_errorboundary1.HTTPAccessFallbackBoundary, {
                            notFound: notFound,
                            forbidden: forbidden,
                            unauthorized: unauthorized,
                            children: /*#__PURE__*/ (0, _jsxruntime.jsxs)(_redirectboundary.RedirectBoundary, {
                                children: [
                                    /*#__PURE__*/ (0, _jsxruntime.jsx)(InnerLayoutRouter, {
                                        url: url,
                                        tree: tree,
                                        params: params,
                                        renderTree: renderTree,
                                        segmentPath: segmentPath,
                                        debugNameContext: childDebugNameContext,
                                        isActive: isActive && stateKey === activeStateKey
                                    }),
                                    segmentBoundaryTriggerNode
                                ]
                            })
                        })
                    })
                }),
                segmentViewStateNode
            ]
        });
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        let child = /*#__PURE__*/ (0, _jsxruntime.jsxs)(_approutercontextsharedruntime.TemplateContext.Provider, {
            value: templateValue,
            children: [
                templateStyles,
                templateScripts,
                template
            ]
        }, stateKey);
        if ("TURBOPACK compile-time truthy", 1) {
            const { SegmentStateProvider } = __turbopack_context__.r("[project]/node_modules/next/dist/next-devtools/userspace/app/segment-explorer-node.js [app-client] (ecmascript)");
            child = /*#__PURE__*/ (0, _jsxruntime.jsxs)(SegmentStateProvider, {
                children: [
                    child,
                    segmentViewBoundaries
                ]
            }, stateKey);
        }
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        children.push(child);
        bfcacheEntry = bfcacheEntry.next;
    }while (bfcacheEntry !== null)
    return children;
}
function getBoundaryDebugNameFromSegment(segment) {
    if (segment === '/') {
        // Reached the root
        return '/';
    }
    if (typeof segment === 'string') {
        if (isVirtualLayout(segment)) {
            return undefined;
        } else {
            return segment + '/';
        }
    }
    const paramCacheKey = segment[1];
    return paramCacheKey + '/';
}
function isVirtualLayout(segment) {
    return(// (like __PAGE__ and __DEFAULT__) to avoid collisions with
    // user-defined route groups.
    segment === '(__SLOT__)');
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/components/render-from-template-context.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return RenderFromTemplateContext;
    }
});
const _interop_require_wildcard = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-client] (ecmascript)");
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const _react = /*#__PURE__*/ _interop_require_wildcard._(__turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"));
const _approutercontextsharedruntime = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/app-router-context.shared-runtime.js [app-client] (ecmascript)");
function RenderFromTemplateContext() {
    const children = (0, _react.useContext)(_approutercontextsharedruntime.TemplateContext);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_jsxruntime.Fragment, {
        children: children
    });
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/request/params.browser.dev.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createRenderParamsFromClient", {
    enumerable: true,
    get: function() {
        return createRenderParamsFromClient;
    }
});
const _reflect = __turbopack_context__.r("[project]/node_modules/next/dist/server/web/spec-extension/adapters/reflect.js [app-client] (ecmascript)");
const _reflectutils = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils/reflect-utils.js [app-client] (ecmascript)");
const CachedParams = new WeakMap();
function makeDynamicallyTrackedParamsWithDevWarnings(underlyingParams) {
    const cachedParams = CachedParams.get(underlyingParams);
    if (cachedParams) {
        return cachedParams;
    }
    const promise = Promise.resolve(underlyingParams);
    const proxiedProperties = new Set();
    Object.keys(underlyingParams).forEach((prop)=>{
        if (_reflectutils.wellKnownProperties.has(prop)) {
        // These properties cannot be shadowed because they need to be the
        // true underlying value for Promises to work correctly at runtime
        } else {
            proxiedProperties.add(prop);
        }
    });
    const proxiedPromise = new Proxy(promise, {
        get (target, prop, receiver) {
            if (typeof prop === 'string') {
                if (proxiedProperties.has(prop)) {
                    const expression = (0, _reflectutils.describeStringPropertyAccess)('params', prop);
                    warnForSyncAccess(expression);
                }
            }
            return _reflect.ReflectAdapter.get(target, prop, receiver);
        },
        set (target, prop, value, receiver) {
            if (typeof prop === 'string') {
                proxiedProperties.delete(prop);
            }
            return _reflect.ReflectAdapter.set(target, prop, value, receiver);
        },
        ownKeys (target) {
            warnForEnumeration();
            return Reflect.ownKeys(target);
        }
    });
    proxiedPromise.status = 'fulfilled';
    proxiedPromise.value = underlyingParams;
    CachedParams.set(underlyingParams, proxiedPromise);
    return proxiedPromise;
}
function warnForSyncAccess(expression) {
    console.error(`A param property was accessed directly with ${expression}. ` + `\`params\` is a Promise and must be unwrapped with \`React.use()\` before accessing its properties. ` + `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`);
}
function warnForEnumeration() {
    console.error(`params are being enumerated. ` + `\`params\` is a Promise and must be unwrapped with \`React.use()\` before accessing its properties. ` + `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`);
}
function createRenderParamsFromClient(clientParams) {
    return makeDynamicallyTrackedParamsWithDevWarnings(clientParams);
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/request/params.browser.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createRenderParamsFromClient", {
    enumerable: true,
    get: function() {
        return createRenderParamsFromClient;
    }
});
const createRenderParamsFromClient = ("TURBOPACK compile-time truthy", 1) ? __turbopack_context__.r("[project]/node_modules/next/dist/client/request/params.browser.dev.js [app-client] (ecmascript)").createRenderParamsFromClient : "TURBOPACK unreachable";
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/request/search-params.browser.dev.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createRenderSearchParamsFromClient", {
    enumerable: true,
    get: function() {
        return createRenderSearchParamsFromClient;
    }
});
const _reflect = __turbopack_context__.r("[project]/node_modules/next/dist/server/web/spec-extension/adapters/reflect.js [app-client] (ecmascript)");
const _reflectutils = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils/reflect-utils.js [app-client] (ecmascript)");
const CachedSearchParams = new WeakMap();
function makeUntrackedSearchParamsWithDevWarnings(underlyingSearchParams) {
    const cachedSearchParams = CachedSearchParams.get(underlyingSearchParams);
    if (cachedSearchParams) {
        return cachedSearchParams;
    }
    const proxiedProperties = new Set();
    const promise = Promise.resolve(underlyingSearchParams);
    Object.keys(underlyingSearchParams).forEach((prop)=>{
        if (_reflectutils.wellKnownProperties.has(prop)) {
        // These properties cannot be shadowed because they need to be the
        // true underlying value for Promises to work correctly at runtime
        } else {
            proxiedProperties.add(prop);
        }
    });
    const proxiedPromise = new Proxy(promise, {
        get (target, prop, receiver) {
            if (typeof prop === 'string') {
                if (!_reflectutils.wellKnownProperties.has(prop) && (proxiedProperties.has(prop) || // We are accessing a property that doesn't exist on the promise nor
                // the underlying searchParams.
                Reflect.has(target, prop) === false)) {
                    const expression = (0, _reflectutils.describeStringPropertyAccess)('searchParams', prop);
                    warnForSyncAccess(expression);
                }
            }
            return _reflect.ReflectAdapter.get(target, prop, receiver);
        },
        set (target, prop, value, receiver) {
            if (typeof prop === 'string') {
                proxiedProperties.delete(prop);
            }
            return Reflect.set(target, prop, value, receiver);
        },
        has (target, prop) {
            if (typeof prop === 'string') {
                if (!_reflectutils.wellKnownProperties.has(prop) && (proxiedProperties.has(prop) || // We are accessing a property that doesn't exist on the promise nor
                // the underlying searchParams.
                Reflect.has(target, prop) === false)) {
                    const expression = (0, _reflectutils.describeHasCheckingStringProperty)('searchParams', prop);
                    warnForSyncAccess(expression);
                }
            }
            return Reflect.has(target, prop);
        },
        ownKeys (target) {
            warnForSyncSpread();
            return Reflect.ownKeys(target);
        }
    });
    proxiedPromise.status = 'fulfilled';
    proxiedPromise.value = underlyingSearchParams;
    CachedSearchParams.set(underlyingSearchParams, proxiedPromise);
    return proxiedPromise;
}
function warnForSyncAccess(expression) {
    console.error(`A searchParam property was accessed directly with ${expression}. ` + `\`searchParams\` is a Promise and must be unwrapped with \`React.use()\` before accessing its properties. ` + `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`);
}
function warnForSyncSpread() {
    console.error(`The keys of \`searchParams\` were accessed directly. ` + `\`searchParams\` is a Promise and must be unwrapped with \`React.use()\` before accessing its properties. ` + `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`);
}
function createRenderSearchParamsFromClient(underlyingSearchParams) {
    return makeUntrackedSearchParamsWithDevWarnings(underlyingSearchParams);
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/request/search-params.browser.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "createRenderSearchParamsFromClient", {
    enumerable: true,
    get: function() {
        return createRenderSearchParamsFromClient;
    }
});
const createRenderSearchParamsFromClient = ("TURBOPACK compile-time truthy", 1) ? __turbopack_context__.r("[project]/node_modules/next/dist/client/request/search-params.browser.dev.js [app-client] (ecmascript)").createRenderSearchParamsFromClient : "TURBOPACK unreachable";
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/client/use-merged-ref.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "useMergedRef", {
    enumerable: true,
    get: function() {
        return useMergedRef;
    }
});
const _react = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
function useMergedRef(refA, refB) {
    const cleanupA = (0, _react.useRef)(null);
    const cleanupB = (0, _react.useRef)(null);
    // NOTE: In theory, we could skip the wrapping if only one of the refs is non-null.
    // (this happens often if the user doesn't pass a ref to Link/Form/Image)
    // But this can cause us to leak a cleanup-ref into user code (previously via `<Link legacyBehavior>`),
    // and the user might pass that ref into ref-merging library that doesn't support cleanup refs
    // (because it hasn't been updated for React 19)
    // which can then cause things to blow up, because a cleanup-returning ref gets called with `null`.
    // So in practice, it's safer to be defensive and always wrap the ref, even on React 19.
    return (0, _react.useCallback)((current)=>{
        if (current === null) {
            const cleanupFnA = cleanupA.current;
            if (cleanupFnA) {
                cleanupA.current = null;
                cleanupFnA();
            }
            const cleanupFnB = cleanupB.current;
            if (cleanupFnB) {
                cleanupB.current = null;
                cleanupFnB();
            }
        } else {
            if (refA) {
                cleanupA.current = applyRef(refA, current);
            }
            if (refB) {
                cleanupB.current = applyRef(refB, current);
            }
        }
    }, [
        refA,
        refB
    ]);
}
function applyRef(refA, current) {
    if (typeof refA === 'function') {
        const cleanup = refA(current);
        if (typeof cleanup === 'function') {
            return cleanup;
        } else {
            return ()=>refA(null);
        }
    } else {
        refA.current = current;
        return ()=>{
            refA.current = null;
        };
    }
}
if ((typeof exports.default === 'function' || typeof exports.default === 'object' && exports.default !== null) && typeof exports.default.__esModule === 'undefined') {
    Object.defineProperty(exports.default, '__esModule', {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/next/dist/lib/metadata/generate/icon-mark.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IconMark", {
    enumerable: true,
    get: function() {
        return IconMark;
    }
});
const _jsxruntime = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/jsx-runtime.js [app-client] (ecmascript)");
const IconMark = ()=>{
    if (typeof window !== 'undefined') {
        return null;
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
        name: "\xabnxt-icon\xbb"
    });
};
}),
"[project]/node_modules/next/dist/server/web/spec-extension/adapters/reflect.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ReflectAdapter", {
    enumerable: true,
    get: function() {
        return ReflectAdapter;
    }
});
class ReflectAdapter {
    static get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'function') {
            return value.bind(target);
        }
        return value;
    }
    static set(target, prop, value, receiver) {
        return Reflect.set(target, prop, value, receiver);
    }
    static has(target, prop) {
        return Reflect.has(target, prop);
    }
    static deleteProperty(target, prop) {
        return Reflect.deleteProperty(target, prop);
    }
}
}),
"[project]/node_modules/next/dist/shared/lib/router/utils/disable-smooth-scroll.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * Run function with `scroll-behavior: auto` applied to `<html/>`.
 * This css change will be reverted after the function finishes.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "disableSmoothScrollDuringRouteTransition", {
    enumerable: true,
    get: function() {
        return disableSmoothScrollDuringRouteTransition;
    }
});
function disableSmoothScrollDuringRouteTransition(fn, options = {}) {
    // if only the hash is changed, we don't need to disable smooth scrolling
    // we only care to prevent smooth scrolling when navigating to a new page to avoid jarring UX
    if (options.onlyHashChange) {
        fn();
        return;
    }
    const htmlElement = document.documentElement;
    const hasDataAttribute = htmlElement.dataset.scrollBehavior === 'smooth';
    if (!hasDataAttribute) {
        // Warn if smooth scrolling is detected but no data attribute is present
        if (("TURBOPACK compile-time value", "development") === 'development' && getComputedStyle(htmlElement).scrollBehavior === 'smooth') {
            const { warnOnce } = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils/warn-once.js [app-client] (ecmascript)");
            warnOnce('Detected `scroll-behavior: smooth` on the `<html>` element. To disable smooth scrolling during route transitions, ' + 'add `data-scroll-behavior="smooth"` to your <html> element. ' + 'Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior');
        }
        // No smooth scrolling configured, run directly without style manipulation
        fn();
        return;
    }
    // Proceed with temporarily disabling smooth scrolling
    const existing = htmlElement.style.scrollBehavior;
    htmlElement.style.scrollBehavior = 'auto';
    if (!options.dontForceLayout) {
        // In Chrome-based browsers we need to force reflow before calling `scrollTo`.
        // Otherwise it will not pickup the change in scrollBehavior
        // More info here: https://github.com/vercel/next.js/issues/40719#issuecomment-1336248042
        htmlElement.getClientRects();
    }
    fn();
    htmlElement.style.scrollBehavior = existing;
}
}),
"[project]/node_modules/next/dist/shared/lib/router/utils/format-url.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// Format function modified from nodejs
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    formatUrl: null,
    formatWithValidation: null,
    urlObjectKeys: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    formatUrl: function() {
        return formatUrl;
    },
    formatWithValidation: function() {
        return formatWithValidation;
    },
    urlObjectKeys: function() {
        return urlObjectKeys;
    }
});
const _interop_require_wildcard = __turbopack_context__.r("[project]/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs [app-client] (ecmascript)");
const _querystring = /*#__PURE__*/ _interop_require_wildcard._(__turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/router/utils/querystring.js [app-client] (ecmascript)"));
const slashedProtocols = /https?|ftp|gopher|file/;
function formatUrl(urlObj) {
    let { auth, hostname } = urlObj;
    let protocol = urlObj.protocol || '';
    let pathname = urlObj.pathname || '';
    let hash = urlObj.hash || '';
    let query = urlObj.query || '';
    let host = false;
    auth = auth ? encodeURIComponent(auth).replace(/%3A/i, ':') + '@' : '';
    if (urlObj.host) {
        host = auth + urlObj.host;
    } else if (hostname) {
        host = auth + (~hostname.indexOf(':') ? `[${hostname}]` : hostname);
        if (urlObj.port) {
            host += ':' + urlObj.port;
        }
    }
    if (query && typeof query === 'object') {
        query = String(_querystring.urlQueryToSearchParams(query));
    }
    let search = urlObj.search || query && `?${query}` || '';
    if (protocol && !protocol.endsWith(':')) protocol += ':';
    if (urlObj.slashes || (!protocol || slashedProtocols.test(protocol)) && host !== false) {
        host = '//' + (host || '');
        if (pathname && pathname[0] !== '/') pathname = '/' + pathname;
    } else if (!host) {
        host = '';
    }
    if (hash && hash[0] !== '#') hash = '#' + hash;
    if (search && search[0] !== '?') search = '?' + search;
    pathname = pathname.replace(/[?#]/g, encodeURIComponent);
    search = search.replace('#', '%23');
    return `${protocol}${host}${pathname}${search}${hash}`;
}
const urlObjectKeys = [
    'auth',
    'hash',
    'host',
    'hostname',
    'href',
    'path',
    'pathname',
    'port',
    'protocol',
    'query',
    'search',
    'slashes'
];
function formatWithValidation(url) {
    if ("TURBOPACK compile-time truthy", 1) {
        if (url !== null && typeof url === 'object') {
            Object.keys(url).forEach((key)=>{
                if (!urlObjectKeys.includes(key)) {
                    console.warn(`Unknown key passed via urlObject into url.format: ${key}`);
                }
            });
        }
    }
    return formatUrl(url);
}
}),
"[project]/node_modules/next/dist/shared/lib/router/utils/is-local-url.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "isLocalURL", {
    enumerable: true,
    get: function() {
        return isLocalURL;
    }
});
const _utils = __turbopack_context__.r("[project]/node_modules/next/dist/shared/lib/utils.js [app-client] (ecmascript)");
const _hasbasepath = __turbopack_context__.r("[project]/node_modules/next/dist/client/has-base-path.js [app-client] (ecmascript)");
function isLocalURL(url) {
    // prevent a hydration mismatch on href for url with anchor refs
    if (!(0, _utils.isAbsoluteUrl)(url)) return true;
    try {
        // absolute urls can be local if they are on the same origin
        const locationOrigin = (0, _utils.getLocationOrigin)();
        const resolved = new URL(url, locationOrigin);
        return resolved.origin === locationOrigin && (0, _hasbasepath.hasBasePath)(resolved.pathname);
    } catch (_) {
        return false;
    }
}
}),
"[project]/node_modules/next/dist/shared/lib/utils.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DecodeError: null,
    MiddlewareNotFoundError: null,
    MissingStaticPage: null,
    NormalizeError: null,
    PageNotFoundError: null,
    SP: null,
    ST: null,
    WEB_VITALS: null,
    execOnce: null,
    getDisplayName: null,
    getLocationOrigin: null,
    getURL: null,
    isAbsoluteUrl: null,
    isResSent: null,
    loadGetInitialProps: null,
    normalizeRepeatedSlashes: null,
    stringifyError: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DecodeError: function() {
        return DecodeError;
    },
    MiddlewareNotFoundError: function() {
        return MiddlewareNotFoundError;
    },
    MissingStaticPage: function() {
        return MissingStaticPage;
    },
    NormalizeError: function() {
        return NormalizeError;
    },
    PageNotFoundError: function() {
        return PageNotFoundError;
    },
    SP: function() {
        return SP;
    },
    ST: function() {
        return ST;
    },
    WEB_VITALS: function() {
        return WEB_VITALS;
    },
    execOnce: function() {
        return execOnce;
    },
    getDisplayName: function() {
        return getDisplayName;
    },
    getLocationOrigin: function() {
        return getLocationOrigin;
    },
    getURL: function() {
        return getURL;
    },
    isAbsoluteUrl: function() {
        return isAbsoluteUrl;
    },
    isResSent: function() {
        return isResSent;
    },
    loadGetInitialProps: function() {
        return loadGetInitialProps;
    },
    normalizeRepeatedSlashes: function() {
        return normalizeRepeatedSlashes;
    },
    stringifyError: function() {
        return stringifyError;
    }
});
const WEB_VITALS = [
    'CLS',
    'FCP',
    'INP',
    'LCP',
    'TTFB'
];
function execOnce(fn) {
    let used = false;
    let result;
    return (...args)=>{
        if (!used) {
            used = true;
            result = fn(...args);
        }
        return result;
    };
}
// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
const isAbsoluteUrl = (url)=>{
    // Fast path: an absolute URL must start with a letter (the scheme).
    // Check for a-z and A-Z without the cost of the regex.
    const c = url.charCodeAt(0);
    const isLetter = c >= 65 /* A */  && c <= 90 || c >= 97 /* a */  && c <= 122;
    /* z */ if (!isLetter) {
        return false;
    }
    return ABSOLUTE_URL_REGEX.test(url);
};
function getLocationOrigin() {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? ':' + port : ''}`;
}
function getURL() {
    const { href } = window.location;
    const origin = getLocationOrigin();
    return href.substring(origin.length);
}
function getDisplayName(Component) {
    return typeof Component === 'string' ? Component : Component.displayName || Component.name || 'Unknown';
}
function isResSent(res) {
    return res.finished || res.headersSent;
}
function normalizeRepeatedSlashes(url) {
    const urlParts = url.split('?');
    const urlNoQuery = urlParts[0];
    return urlNoQuery // first we replace any non-encoded backslashes with forward
    // then normalize repeated forward slashes
    .replace(/\\/g, '/').replace(/\/\/+/g, '/') + (urlParts[1] ? `?${urlParts.slice(1).join('?')}` : '');
}
async function loadGetInitialProps(App, ctx) {
    if ("TURBOPACK compile-time truthy", 1) {
        if (App.prototype?.getInitialProps) {
            const message = `"${getDisplayName(App)}.getInitialProps()" is defined as an instance method - visit https://nextjs.org/docs/messages/get-initial-props-as-an-instance-method for more information.`;
            throw new Error(message);
        }
    }
    // when called from _app `ctx` is nested in `ctx`
    const res = ctx.res || ctx.ctx && ctx.ctx.res;
    if (!App.getInitialProps) {
        if (ctx.ctx && ctx.Component) {
            // @ts-ignore pageProps default
            return {
                pageProps: await loadGetInitialProps(ctx.Component, ctx.ctx)
            };
        }
        return {};
    }
    const props = await App.getInitialProps(ctx);
    if (res && isResSent(res)) {
        return props;
    }
    if (!props) {
        const message = `"${getDisplayName(App)}.getInitialProps()" should resolve to an object. But found "${props}" instead.`;
        throw new Error(message);
    }
    if ("TURBOPACK compile-time truthy", 1) {
        if (Object.keys(props).length === 0 && !ctx.ctx) {
            console.warn(`${getDisplayName(App)} returned an empty object from \`getInitialProps\`. This de-optimizes and prevents automatic static optimization. https://nextjs.org/docs/messages/empty-object-getInitialProps`);
        }
    }
    return props;
}
const SP = typeof performance !== 'undefined';
const ST = SP && [
    'mark',
    'measure',
    'getEntriesByName'
].every((method)=>typeof performance[method] === 'function');
class DecodeError extends Error {
}
class NormalizeError extends Error {
}
class PageNotFoundError extends Error {
    constructor(page){
        super();
        this.code = 'ENOENT';
        this.name = 'PageNotFoundError';
        this.message = `Cannot find module for page: ${page}`;
    }
}
class MissingStaticPage extends Error {
    constructor(page, message){
        super();
        this.message = `Failed to load static file for page: ${page} ${message}`;
    }
}
class MiddlewareNotFoundError extends Error {
    constructor(){
        super();
        this.code = 'ENOENT';
        this.message = `Cannot find the middleware module`;
    }
}
function stringifyError(error) {
    return JSON.stringify({
        message: error.message,
        stack: error.stack
    });
}
}),
"[project]/node_modules/next/dist/shared/lib/utils/error-once.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "errorOnce", {
    enumerable: true,
    get: function() {
        return errorOnce;
    }
});
let errorOnce = (_)=>{};
if ("TURBOPACK compile-time truthy", 1) {
    const errors = new Set();
    errorOnce = (msg)=>{
        if (!errors.has(msg)) {
            console.error(msg);
        }
        errors.add(msg);
    };
}
}),
"[project]/node_modules/next/dist/shared/lib/utils/reflect-utils.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This regex will have fast negatives meaning valid identifiers may not pass
// this test. However this is only used during static generation to provide hints
// about why a page bailed out of some or all prerendering and we can use bracket notation
// for example while `ಠ_ಠ` is a valid identifier it's ok to print `searchParams['ಠ_ಠ']`
// even if this would have been fine too `searchParams.ಠ_ಠ`
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    describeHasCheckingStringProperty: null,
    describeStringPropertyAccess: null,
    wellKnownProperties: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    describeHasCheckingStringProperty: function() {
        return describeHasCheckingStringProperty;
    },
    describeStringPropertyAccess: function() {
        return describeStringPropertyAccess;
    },
    wellKnownProperties: function() {
        return wellKnownProperties;
    }
});
const isDefinitelyAValidIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
function describeStringPropertyAccess(target, prop) {
    if (isDefinitelyAValidIdentifier.test(prop)) {
        return `\`${target}.${prop}\``;
    }
    return `\`${target}[${JSON.stringify(prop)}]\``;
}
function describeHasCheckingStringProperty(target, prop) {
    const stringifiedProp = JSON.stringify(prop);
    return `\`Reflect.has(${target}, ${stringifiedProp})\`, \`${stringifiedProp} in ${target}\`, or similar`;
}
const wellKnownProperties = new Set([
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toString',
    'valueOf',
    'toLocaleString',
    // Promise prototype
    'then',
    'catch',
    'finally',
    // React Promise extension
    'status',
    // 'value',
    // 'error',
    // React introspection
    'displayName',
    '_debugInfo',
    // Common tested properties
    'toJSON',
    '$$typeof',
    '__esModule',
    // Tested by flight when checking for iterables
    '@@iterator'
]);
}),
"[project]/src/components/auth-provider.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/auth.service.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])({
    ready: false,
    loggedIn: false,
    user: null,
    isAdmin: false,
    login: async ()=>{},
    register: async ()=>{},
    logout: ()=>{}
});
function AuthProvider({ children }) {
    _s();
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const sync = {
                "AuthProvider.useEffect.sync": ()=>setSession((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["readSession"])())
            }["AuthProvider.useEffect.sync"];
            sync();
            setReady(true);
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["subscribeSession"])(sync);
        }
    }["AuthProvider.useEffect"], []);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[login]": async (credentials)=>{
            const next = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["login"](credentials);
            setSession(next);
            return next;
        }
    }["AuthProvider.useCallback[login]"], []);
    const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[register]": (payload)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["register"](payload)
    }["AuthProvider.useCallback[register]"], []);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthProvider.useCallback[logout]": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"]();
            setSession(null);
        }
    }["AuthProvider.useCallback[logout]"], []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AuthProvider.useMemo[value]": ()=>{
            const user = session?.account ?? null;
            return {
                ready,
                loggedIn: Boolean(user),
                user,
                isAdmin: user?.role === "ADMIN",
                login,
                register,
                logout
            };
        }
    }["AuthProvider.useMemo[value]"], [
        ready,
        session,
        login,
        register,
        logout
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/auth-provider.jsx",
        lineNumber: 39,
        columnNumber: 12
    }, this);
}
_s(AuthProvider, "VqafPr4BWsoeE7UNVPBdIY6SQUk=");
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
};
_s1(useAuth, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/header.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth-provider.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$site$2d$brand$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/site-brand.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/labels.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const publicNavigation = [
    [
        "/explore",
        "Khám phá xe"
    ],
    [
        "/my-trips",
        "Chuyến xe của tôi"
    ],
    [
        "/list-your-car",
        "Cho thuê xe"
    ],
    [
        "/pricing",
        "Cách tính giá"
    ]
];
const memberNavigation = [
    [
        "/explore",
        "Khám phá xe"
    ],
    [
        "/my-trips",
        "Chuyến xe của tôi"
    ],
    [
        "/owner/dashboard",
        "Chủ xe"
    ],
    [
        "/pricing",
        "Cách tính giá"
    ]
];
const adminLink = [
    "/admin/dashboard",
    "Quản trị"
];
const accountLinks = [
    [
        "/account",
        "Hồ sơ cá nhân",
        "badge"
    ],
    [
        "/account/orders",
        "Đơn thuê xe",
        "receipt_long"
    ],
    [
        "/account/history",
        "Lịch sử chuyến đi",
        "history"
    ],
    [
        "/account/bank",
        "Tài khoản ngân hàng",
        "account_balance"
    ],
    [
        "/owner/dashboard",
        "Kênh chủ xe",
        "directions_car"
    ]
];
function Header({ previewState } = {}) {
    _s();
    const instance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])();
    const mobileId = previewState === undefined ? "mobile-navigation" : `mobile-navigation-${instance}`;
    const accountId = previewState === undefined ? "account-menu" : `account-menu-${instance}`;
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { loggedIn: authenticated, user, isAdmin, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const loggedIn = previewState ?? authenticated;
    const displayName = user?.fullName || (previewState ? "Khách hàng CarDB" : "Tài khoản");
    const displayCode = user ? `${user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"} • #${user.id}` : "CarDB";
    const navigation = loggedIn ? isAdmin ? [
        ...memberNavigation,
        adminLink
    ] : memberNavigation : publicNavigation;
    const menuLinks = isAdmin ? [
        ...accountLinks,
        [
            "/admin/dashboard",
            "Trang quản trị",
            "admin_panel_settings"
        ]
    ] : accountLinks;
    const activePath = previewState === undefined ? path : loggedIn ? "/my-trips" : "/explore";
    const overPhoto = previewState === undefined && (path === "/login" || path === "/register");
    const [menu, setMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [account, setAccount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    function close() {
        setMenu(false);
        setAccount(false);
    }
    function signOut() {
        logout();
        close();
        router.push("/");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: `site-header ${overPhoto ? "auth-overlay" : "border-border-light bg-white/95 backdrop-blur-xl"} ${previewState === undefined ? `fixed inset-x-0 top-0 z-50 ${overPhoto ? "" : "border-b"}` : "relative w-full rounded-2xl border shadow-sm"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$site$2d$brand$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SiteBrand"], {
                        compact: true,
                        onClick: close
                    }, void 0, false, {
                        fileName: "[project]/src/components/header.jsx",
                        lineNumber: 33,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        "aria-label": "Điều hướng chính",
                        className: "hidden items-center gap-1 lg:flex",
                        children: navigation.map(([href, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: href,
                                onClick: close,
                                "aria-current": activePath.startsWith(href) ? "page" : undefined,
                                className: `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${activePath.startsWith(href) ? "bg-accent-soft font-semibold text-brand-accent" : "text-text-secondary hover:bg-section-bg hover:text-text-primary"}`,
                                children: label
                            }, href, false, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 34,
                                columnNumber: 123
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/header.jsx",
                        lineNumber: 34,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 sm:gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "tel:19008899",
                                className: "hidden shrink-0 items-center gap-2 md:flex",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex size-8 items-center justify-center rounded-full bg-accent-soft text-brand-accent",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                            name: "call",
                                            className: "text-[16px]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/header.jsx",
                                            lineNumber: 36,
                                            columnNumber: 191
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 36,
                                        columnNumber: 87
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-semibold uppercase leading-none text-text-secondary",
                                                children: "Hỗ trợ 24/7"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 36,
                                                columnNumber: 279
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-xs leading-none text-brand-accent",
                                                children: "1900 8899"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 36,
                                                columnNumber: 383
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 36,
                                        columnNumber: 241
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 36,
                                columnNumber: 9
                            }, this),
                            loggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-label": `Tài khoản ${displayName}`,
                                        "aria-expanded": account,
                                        "aria-controls": accountId,
                                        onClick: ()=>{
                                            setAccount((value)=>!value);
                                            setMenu(false);
                                        },
                                        className: "flex items-center gap-2 border-l border-border-light py-2 pl-3 text-left sm:gap-3 sm:pl-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-accent to-[#ff8f59] text-xs font-bold text-white shadow-inner",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initials"])(displayName)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 37,
                                                        columnNumber: 353
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 37,
                                                        columnNumber: 545
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 37,
                                                columnNumber: 326
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hidden flex-col gap-1 sm:flex",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1.5 text-xs font-bold leading-none text-text-primary",
                                                        children: [
                                                            displayName,
                                                            isAdmin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-700",
                                                                children: "ADMIN"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/header.jsx",
                                                                lineNumber: 37,
                                                                columnNumber: 821
                                                            }, this) : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 37,
                                                        columnNumber: 704
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] leading-none text-text-secondary",
                                                        children: displayCode
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 37,
                                                        columnNumber: 950
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 37,
                                                columnNumber: 656
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: "expand_more",
                                                className: "text-[18px] text-text-secondary"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 37,
                                                columnNumber: 1040
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 37,
                                        columnNumber: 47
                                    }, this),
                                    account ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                tabIndex: -1,
                                                "aria-label": "Đóng menu tài khoản",
                                                onClick: ()=>setAccount(false),
                                                className: "fixed inset-0 z-[-1] cursor-default"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 38,
                                                columnNumber: 24
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                                id: accountId,
                                                "aria-label": "Tài khoản",
                                                onKeyDown: (event)=>{
                                                    if (event.key === "Escape") setAccount(false);
                                                },
                                                className: "absolute right-0 top-full mt-2 w-60 rounded-xl border border-border-light bg-white p-2 shadow-xl",
                                                children: [
                                                    menuLinks.map(([href, label, icon])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: href,
                                                            onClick: close,
                                                            className: "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-text-primary hover:bg-accent-soft hover:text-brand-accent",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                    name: icon,
                                                                    className: "text-[18px]"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/header.jsx",
                                                                    lineNumber: 39,
                                                                    columnNumber: 359
                                                                }, this),
                                                                label
                                                            ]
                                                        }, href, true, {
                                                            fileName: "[project]/src/components/header.jsx",
                                                            lineNumber: 39,
                                                            columnNumber: 184
                                                        }, this)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: signOut,
                                                        className: "mt-1 flex w-full items-center gap-2 rounded-lg border-t border-border-light px-3 py-2.5 text-sm text-error hover:bg-error-container/30",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                name: "logout",
                                                                className: "text-[18px]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/header.jsx",
                                                                lineNumber: 39,
                                                                columnNumber: 605
                                                            }, this),
                                                            "Đăng xuất"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 39,
                                                        columnNumber: 418
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 38,
                                                columnNumber: 176
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 38,
                                        columnNumber: 22
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 37,
                                columnNumber: 21
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/login",
                                        className: "rounded-lg px-2 py-2 text-xs font-semibold text-text-primary hover:text-brand-accent sm:text-sm",
                                        children: "Đăng nhập"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 40,
                                        columnNumber: 20
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/register",
                                        className: "hidden items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-shadow hover:bg-primary-hover hover:shadow-md sm:inline-flex",
                                        children: [
                                            "Đăng ký",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: "arrow_forward",
                                                className: "text-[16px]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 40,
                                                columnNumber: 384
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 40,
                                        columnNumber: 164
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 40,
                                columnNumber: 18
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                "aria-label": menu ? "Đóng menu" : "Mở menu",
                                "aria-expanded": menu,
                                "aria-controls": mobileId,
                                onClick: ()=>{
                                    setMenu((value)=>!value);
                                    setAccount(false);
                                },
                                className: "header-menu-toggle flex size-9 items-center justify-center rounded-lg border border-border-light text-text-primary lg:hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: menu ? "close" : "menu"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/header.jsx",
                                    lineNumber: 41,
                                    columnNumber: 323
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 41,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/header.jsx",
                        lineNumber: 35,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/header.jsx",
                lineNumber: 32,
                columnNumber: 5
            }, this),
            menu ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                id: mobileId,
                "aria-label": "Điều hướng di động",
                className: "header-mobile-navigation border-t border-border-light bg-white px-4 py-3 shadow-lg lg:hidden",
                children: [
                    navigation.map(([href, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: href,
                            onClick: close,
                            "aria-current": activePath.startsWith(href) ? "page" : undefined,
                            className: `block rounded-lg px-4 py-3 text-sm font-semibold ${activePath.startsWith(href) ? "bg-accent-soft text-brand-accent" : "text-text-primary hover:bg-accent-soft hover:text-brand-accent"}`,
                            children: label
                        }, href, false, {
                            fileName: "[project]/src/components/header.jsx",
                            lineNumber: 44,
                            columnNumber: 204
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 flex justify-between border-t border-border-light px-4 pt-4 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: loggedIn ? "/account" : "/register",
                                onClick: close,
                                children: loggedIn ? "Hồ sơ cá nhân" : "Đăng ký tài khoản"
                            }, void 0, false, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 44,
                                columnNumber: 617
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "tel:19008899",
                                className: "font-semibold text-brand-accent",
                                children: "1900 8899"
                            }, void 0, false, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 44,
                                columnNumber: 739
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/header.jsx",
                        lineNumber: 44,
                        columnNumber: 527
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/header.jsx",
                lineNumber: 44,
                columnNumber: 13
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/header.jsx",
        lineNumber: 31,
        columnNumber: 12
    }, this);
}
_s(Header, "1O5EGnpCnlXpVUL+KXTx8ER6n40=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/hold-button.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HoldButton",
    ()=>HoldButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function HoldButton({ children, onComplete, danger = false, disabled = false }) {
    _s();
    const hint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"])();
    const [holding, setHolding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fill = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const frame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const started = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const complete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onComplete);
    complete.current = onComplete;
    function stop() {
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        frame.current = null;
        started.current = null;
        setHolding(false);
        if (fill.current) fill.current.style.transform = "scaleX(0)";
    }
    function start() {
        if (disabled || started.current !== null) return;
        started.current = performance.now();
        setHolding(true);
        function tick(now) {
            if (started.current === null) return;
            const progress = Math.min((now - started.current) / 1600, 1);
            if (fill.current) fill.current.style.transform = `scaleX(${progress})`;
            if (progress >= 1) {
                stop();
                complete.current();
            } else frame.current = requestAnimationFrame(tick);
        }
        frame.current = requestAnimationFrame(tick);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HoldButton.useEffect": ()=>({
                "HoldButton.useEffect": ()=>{
                    if (frame.current !== null) cancelAnimationFrame(frame.current);
                }
            })["HoldButton.useEffect"]
    }["HoldButton.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        "data-hold-control": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                disabled: disabled,
                "aria-describedby": hint,
                onPointerDown: (event)=>{
                    if (event.button !== 0) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    start();
                },
                onPointerUp: stop,
                onPointerCancel: stop,
                onPointerLeave: stop,
                onBlur: stop,
                onContextMenu: (event)=>event.preventDefault(),
                onKeyDown: (event)=>{
                    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                        event.preventDefault();
                        start();
                    }
                },
                onKeyUp: (event)=>{
                    if (event.key === " " || event.key === "Enter") {
                        event.preventDefault();
                        stop();
                    }
                },
                className: `relative flex w-full touch-none select-none items-center justify-center gap-2 overflow-hidden rounded-full px-3 py-4 text-xs font-bold sm:px-6 sm:text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${danger ? "border border-error/25 bg-error-container/40 text-error hover:bg-error-container/70" : "bg-primary text-white shadow-md hover:bg-primary-container"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        ref: fill,
                        "aria-hidden": "true",
                        className: `pointer-events-none absolute inset-0 origin-left scale-x-0 ${danger ? "bg-error/15" : "bg-secondary-fixed/25"}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/hold-button.jsx",
                        lineNumber: 58,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "relative flex items-center justify-center gap-2 whitespace-nowrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: danger ? "cancel" : "verified",
                                className: "text-[20px]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/hold-button.jsx",
                                lineNumber: 59,
                                columnNumber: 91
                            }, this),
                            holding ? "Tiếp tục giữ…" : children
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/hold-button.jsx",
                        lineNumber: 59,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/hold-button.jsx",
                lineNumber: 44,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                id: hint,
                className: "mt-2 text-center text-[11px] leading-5 text-text-muted",
                children: [
                    "Giữ 1,6 giây để ",
                    danger ? "hủy" : "xác nhận",
                    ". Thả tay để dừng. Bàn phím: giữ Enter hoặc Space."
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/hold-button.jsx",
                lineNumber: 61,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/hold-button.jsx",
        lineNumber: 43,
        columnNumber: 12
    }, this);
}
_s(HoldButton, "Gea1kRJcU2bLeqfJaeNGvhzvr98=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useId"]
    ];
});
_c = HoldButton;
var _c;
__turbopack_context__.k.register(_c, "HoldButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/icon.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Icon",
    ()=>Icon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
function Icon({ name, className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "aria-hidden": "true",
        className: `material-symbols-outlined inline-block size-[1em] overflow-hidden text-center leading-none ${className}`,
        children: name
    }, void 0, false, {
        fileName: "[project]/src/components/icon.jsx",
        lineNumber: 2,
        columnNumber: 12
    }, this);
}
_c = Icon;
var _c;
__turbopack_context__.k.register(_c, "Icon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/interactions.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Interactions",
    ()=>Interactions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth-provider.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hold$2d$button$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hold-button.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const money = (value)=>Math.round(value).toLocaleString("vi-VN") + " đ";
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}
function activate(button) {
    button.parentElement?.querySelectorAll(":scope > button").forEach((el)=>{
        el.dataset.active = String(el === button);
        el.setAttribute("aria-pressed", String(el === button));
    });
}
function filterCars(category) {
    document.querySelectorAll("[data-vehicle-card]").forEach((card)=>{
        card.dataset.filterHidden = String(category !== "all" && card.dataset.vehicleCard !== category);
    });
}
function Modal({ title, close, children }) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Modal.useEffect": ()=>{
            ref.current?.showModal();
        }
    }["Modal.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dialog", {
        ref: ref,
        onCancel: close,
        onClick: (event)=>{
            if (event.currentTarget === event.target) close();
        },
        "aria-labelledby": "app-dialog-title",
        className: "m-auto w-[calc(100%-2rem)] max-w-2xl rounded-xl border border-border-light bg-white p-0 text-text-primary shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-5 sm:p-7",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-5 flex items-start justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            id: "app-dialog-title",
                            className: "text-xl font-bold",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/components/interactions.jsx",
                            lineNumber: 16,
                            columnNumber: 321
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            "aria-label": "Đóng hộp thoại",
                            onClick: close,
                            className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-section-bg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "close",
                                className: "text-[20px]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/interactions.jsx",
                                lineNumber: 16,
                                columnNumber: 543
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/interactions.jsx",
                            lineNumber: 16,
                            columnNumber: 389
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/interactions.jsx",
                    lineNumber: 16,
                    columnNumber: 260
                }, this),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/interactions.jsx",
            lineNumber: 16,
            columnNumber: 232
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/interactions.jsx",
        lineNumber: 15,
        columnNumber: 12
    }, this);
}
_s(Modal, "8uVE59eA/r6b92xF80p7sH8rXLk=");
_c = Modal;
function Interactions({ children }) {
    _s1();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const { login, register } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const toastTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [modal, setModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [empty, setEmpty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rating, setRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    function notify(text) {
        setToast(text);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(()=>setToast(""), 4000);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Interactions.useEffect": ()=>({
                "Interactions.useEffect": ()=>{
                    if (toastTimer.current) clearTimeout(toastTimer.current);
                }
            })["Interactions.useEffect"]
    }["Interactions.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Interactions.useEffect": ()=>{
            setModal(null);
            setEmpty(false);
            setRating(0);
            const params = new URLSearchParams(window.location.search);
            if (params.get("filter")) filterCars(params.get("filter"));
            if (params.has("cancelled")) notify("Đã hủy yêu cầu thuê xe.");
            const scope = root.current;
            if (!scope) return;
            scope.querySelectorAll("[data-handler='toggleCard']").forEach({
                "Interactions.useEffect": (el)=>{
                    el.tabIndex = 0;
                    el.setAttribute("role", "button");
                    el.setAttribute("aria-expanded", String(!el.closest("[id^='card-']")?.querySelector(".card-body,.card-content")?.classList.contains("hidden")));
                }
            }["Interactions.useEffect"]);
            scope.querySelectorAll("input:not([id])").forEach({
                "Interactions.useEffect": (input, index)=>input.id = `cardb-field-${index}`
            }["Interactions.useEffect"]);
            scope.querySelectorAll("[data-star]").forEach({
                "Interactions.useEffect": (el)=>el.setAttribute("aria-label", `${el.dataset.star} sao`)
            }["Interactions.useEffect"]);
            scope.querySelectorAll("[data-val]").forEach({
                "Interactions.useEffect": (el)=>el.setAttribute("aria-label", `Đánh giá ${el.dataset.val} sao`)
            }["Interactions.useEffect"]);
            const dialog = scope.querySelector("#modal-add-bank,#change-default-bank-modal");
            if (dialog) {
                dialog.setAttribute("role", "dialog");
                dialog.setAttribute("aria-modal", "true");
                dialog.setAttribute("aria-label", path.endsWith("/add") ? "Thêm tài khoản ngân hàng" : "Đổi tài khoản mặc định");
                dialog.querySelector("input,button")?.focus();
            }
            if (path.endsWith("bank/add") && params.get("edit") === "1") {
                const heading = dialog?.querySelector("h2,h3");
                if (heading) heading.textContent = "Chỉnh sửa tài khoản ngân hàng";
                const number = document.getElementById("account-number");
                if (number) number.value = "0071001234982";
            }
            if (path === "/account") try {
                const saved = JSON.parse(localStorage.getItem("cardb:profile:v1") ?? "{}");
                for (const [id, value] of Object.entries(saved)){
                    const field = document.getElementById(id);
                    if (field instanceof HTMLInputElement) field.value = String(value);
                    else if (field) field.textContent = String(value);
                }
            } catch  {}
        }
    }["Interactions.useEffect"], [
        path
    ]);
    async function copy(value) {
        try {
            await navigator.clipboard.writeText(value);
            notify("Đã sao chép: " + value);
        } catch  {
            setModal({
                kind: "info",
                title: "Thông tin cần sao chép",
                body: value
            });
        }
    }
    function search(button) {
        const container = button.closest("section") ?? root.current;
        const location = container?.querySelector("select")?.value ?? "TP. Hồ Chí Minh";
        const fields = container?.querySelectorAll('input[type="text"]');
        const params = new URLSearchParams({
            location,
            start: fields?.[0]?.value ?? "08:00, 25/10/2026",
            end: fields?.[1]?.value ?? "20:00, 27/10/2026"
        });
        if (path === "/explore") {
            notify("Đã cập nhật thời gian tìm xe.");
            return;
        }
        router.push("/explore?" + params);
    }
    function click(event) {
        const target = event.target;
        if (target.closest("[data-hold-control],[data-native]")) return;
        const button = target.closest("button,a,[data-action],[data-handler],[data-tab-target]");
        if (!button) {
            if (target.tagName === "IMG" && target.closest("main") && !path.includes("dang-") && !target.closest("a")) {
                const img = target;
                setModal({
                    kind: "image",
                    title: img.alt || "Hình ảnh xe",
                    image: img.src
                });
            }
            return;
        }
        if (button.getAttribute("type") === "submit") return;
        const text = (button.getAttribute("aria-label") || button.textContent || "").trim();
        const handler = button.dataset.handler ?? "";
        const arg = button.dataset.args?.match(/['"]([^'"]+)['"]/)?.[1] ?? "";
        const action = button.dataset.action;
        if (handler === "toggleCancelModal" && button.dataset.args?.includes("true") || action === "cancel-order") {
            setModal({
                kind: "cancel",
                title: "Hủy yêu cầu thuê xe",
                body: "Giữ nút bên dưới để xác nhận hủy. Thả tay trước khi hết thời gian để giữ nguyên yêu cầu."
            });
            return;
        }
        if (button.dataset.route) {
            router.push(button.dataset.route);
            return;
        }
        if (handler === "switchAuthTab") {
            router.push(arg === "register" ? "/register" : "/login");
            return;
        }
        if (handler === "togglePasswordVisibility" || action === "password") {
            const input = arg ? document.getElementById(arg) : button.parentElement?.querySelector("input");
            if (input) input.type = input.type === "password" ? "text" : "password";
            return;
        }
        if (handler === "toggleCard") {
            const card = document.getElementById(arg);
            if (card) {
                const content = card.querySelector(".card-body,.card-content,.details-content,.expandable-content") ?? card.lastElementChild;
                content?.classList.toggle("hidden");
                if (content) content.style.display = content.classList.contains("hidden") ? "none" : "";
                button.setAttribute("aria-expanded", String(!content?.classList.contains("hidden")));
            }
            return;
        }
        if (handler === "selectPaymentMethod") {
            const group = document.getElementById("payment-methods");
            group?.querySelectorAll("[data-handler='selectPaymentMethod']").forEach((el)=>el.dataset.active = String(el === button));
            notify("Đã chọn phương thức thanh toán.");
            return;
        }
        if (handler === "copyOrderCode" || handler === "navigator.clipboard.writeText" || action === "copy") {
            void copy(arg || "CDB-ORD-20261026-904");
            return;
        }
        if (handler === "window.print" || action === "receipt") {
            window.print();
            return;
        }
        if (action === "trip-filter") {
            const status = button.dataset.statusFilter;
            activate(button);
            root.current?.querySelectorAll("[data-trip-card]").forEach((card)=>card.dataset.filterHidden = String(status !== "all" && card.dataset.tripStatus !== status));
            setEmpty(!root.current?.querySelector('[data-trip-card]:not([data-filter-hidden="true"])'));
            return;
        }
        if (action === "choice") {
            activate(button);
            notify(`Đã chọn ${text.replace(/^\+\s*/, "")}.`);
            return;
        }
        if (action === "page") {
            activate(button);
            notify(/^[1-9]\d*$/.test(text) ? `Đã chọn trang ${text}. Các mục hiện có được hiển thị trong danh sách.` : "Danh sách hiện đã hiển thị các mục có sẵn.");
            return;
        }
        if (action === "view-layout") {
            const card = root.current?.querySelector("[data-vehicle-card]");
            if (card?.parentElement) card.parentElement.dataset.resultsLayout = button.dataset.layout;
            activate(button);
            return;
        }
        if (action === "edit-search") {
            root.current?.querySelector("section")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            notify("Chọn lại ngày nhận, ngày trả xe và nhấn Cập nhật.");
            return;
        }
        if (action === "refresh-list") {
            router.refresh();
            notify("Đã làm mới danh sách chuyến xe.");
            return;
        }
        if (action === "download-report") {
            const lines = root.current?.querySelector("main")?.innerText.split("\n").filter(Boolean) ?? [];
            const csv = "\ufeffNội dung\n" + lines.map((line)=>'"' + line.replaceAll('"', '""') + '"').join("\n");
            const url = URL.createObjectURL(new Blob([
                csv
            ], {
                type: "text/csv;charset=utf-8"
            }));
            const download = document.createElement("a");
            download.href = url;
            download.download = "cardb-lich-su.csv";
            download.click();
            setTimeout(()=>URL.revokeObjectURL(url), 1000);
            notify("Đã xuất lịch sử dạng CSV, có thể mở bằng Excel.");
            return;
        }
        if (action === "media-info") {
            setModal({
                kind: "info",
                title: text,
                body: "Nội dung này đang được cập nhật. Bạn có thể xem ảnh thực tế trong thư viện xe hoặc liên hệ 1900 8899 để được hỗ trợ."
            });
            return;
        }
        if (action === "contact-owner") {
            setModal({
                kind: "info",
                title: "Liên hệ chủ xe",
                body: "Liên hệ tổng đài CarDB 1900 8899 để được kết nối với chủ xe và tư vấn lịch trình."
            });
            return;
        }
        if (action === "preview-attachment") {
            setModal({
                kind: "info",
                title: "Bằng chứng đính kèm",
                body: "anh_taplo_dong_ho_tra_xe_08h00.jpg — Tải lên ảnh từ thiết bị để đính kèm bằng chứng của bạn."
            });
            return;
        }
        if (action === "remove-attachment") {
            button.closest("[data-attachment]")?.remove();
            setText("attachment-count", `Tài liệu đã chuẩn bị đính kèm (${root.current?.querySelectorAll("[data-attachment]").length ?? 0})`);
            notify("Đã xóa tệp đính kèm.");
            return;
        }
        if (action === "remove-voucher" || action === "apply-voucher") {
            const input = document.getElementById("voucher-input");
            const apply = action === "apply-voucher";
            if (apply && !input?.value.trim()) {
                notify("Nhập mã ưu đãi trước khi áp dụng.");
                input?.focus();
                return;
            }
            const total = apply ? 3700000 : 3900000;
            root.current?.querySelectorAll("[data-checkout-total]").forEach((el)=>el.textContent = el.dataset.checkoutTotal === "number" ? total.toLocaleString("vi-VN") : money(total));
            const discount = root.current?.querySelector("[data-voucher-discount]");
            if (discount) discount.textContent = money(apply ? -200000 : 0);
            const status = document.getElementById("voucher-status-box");
            if (status) {
                status.style.display = apply ? "" : "none";
                const code = status.querySelector("strong");
                if (code && input) code.textContent = input.value.toUpperCase();
            }
            if (!apply && input) input.value = "";
            setText("btn-apply-voucher", apply ? "Đã áp dụng" : "Áp dụng");
            notify(apply ? "Đã áp dụng mã ưu đãi." : "Đã bỏ mã ưu đãi.");
            return;
        }
        if (action === "search") {
            search(button);
            return;
        }
        if (action === "rental-mode") {
            activate(button);
            return;
        }
        if (action === "filter") {
            const category = /điện|EV|Điện/.test(text) ? "ev" : /SUV|Gầm cao/.test(text) ? "suv" : /Sedan|sang/.test(text) ? "luxury" : "all";
            filterCars(category);
            activate(button);
            return;
        }
        if (action === "apply-filter") {
            const fuel = root.current?.querySelector('aside input[type="radio"]:checked');
            const label = fuel?.closest("label")?.textContent ?? "";
            const category = /điện|EV|Điện/.test(label) ? "ev" : "all";
            filterCars(category);
            setEmpty(document.querySelectorAll('[data-vehicle-card]:not([data-filter-hidden="true"])').length === 0);
            notify("Đã áp dụng bộ lọc.");
            return;
        }
        if (action === "clear-filter") {
            filterCars("all");
            setEmpty(false);
            root.current?.querySelectorAll('aside input[type="checkbox"],aside input[type="radio"]').forEach((input)=>input.checked = false);
            notify("Đã xóa bộ lọc.");
            return;
        }
        if (action === "favorite") {
            button.dataset.favorite = String(button.dataset.favorite !== "true");
            button.setAttribute("aria-pressed", button.dataset.favorite);
            notify(button.dataset.favorite === "true" ? "Đã lưu xe yêu thích." : "Đã bỏ lưu xe.");
            return;
        }
        if (action === "demo-login") {
            router.push("/login");
            return;
        }
        if (action === "edit-profile" || button.id === "btnEditProfile") {
            for (const id of [
                "fieldFullName",
                "fieldPhone",
                "fieldDob",
                "fieldAddress"
            ]){
                const field = document.getElementById(id);
                if (field instanceof HTMLInputElement) {
                    field.readOnly = false;
                    field.disabled = false;
                    field.focus();
                } else if (field) {
                    field.contentEditable = "true";
                    field.classList.add("outline", "outline-brand-accent");
                }
            }
            setText("editBtnText", "Đang chỉnh sửa");
            notify("Bạn có thể chỉnh sửa thông tin cá nhân.");
            return;
        }
        if (action === "save-profile" || button.id === "btnSaveProfile") {
            const saved = {};
            for (const id of [
                "fieldFullName",
                "fieldPhone",
                "fieldDob",
                "fieldAddress"
            ]){
                const field = document.getElementById(id);
                if (field instanceof HTMLInputElement) saved[id] = field.value;
                else if (field) saved[id] = field.textContent ?? "";
            }
            try {
                localStorage.setItem("cardb:profile:v1", JSON.stringify(saved));
            } catch  {}
            notify("Đã lưu thay đổi.");
            return;
        }
        if (button.dataset.star || button.dataset.val) {
            const score = Number(button.dataset.star || button.dataset.val);
            if (button.dataset.star) setRating(score);
            button.parentElement?.querySelectorAll("button").forEach((el)=>el.dataset.ratingActive = String(Number(el.dataset.star || el.dataset.val) <= score));
            setText("rating-feedback-label", `${score} sao — ${score >= 4 ? "Hài lòng" : "Đã ghi nhận lựa chọn"}`);
            return;
        }
        if (action === "review" || button.id === "submit-review-btn") {
            if (!rating) {
                notify("Vui lòng chọn số sao đánh giá.");
                return;
            }
            notify("Đã gửi đánh giá chuyến đi.");
            router.push("/account/history");
            return;
        }
        if (action === "dispute" || button.id === "submit-dispute-btn") {
            const reason = document.getElementById("dispute-detail");
            if (!reason?.value.trim()) {
                notify("Vui lòng nhập nội dung cần xem xét.");
                reason?.focus();
                return;
            }
            notify("Đã gửi yêu cầu xem xét.");
            router.push("/orders/CDB-ORD-20261026-904");
            return;
        }
        if (action === "upload") {
            const input = button.closest("section")?.querySelector('input[type="file"]') ?? document.querySelector('input[type="file"]');
            if (input) input.click();
            else {
                const picker = document.createElement("input");
                picker.type = "file";
                picker.accept = "image/*,.pdf";
                picker.multiple = true;
                picker.onchange = ()=>notify(`Đã chọn ${picker.files?.length ?? 0} tệp cho bản xem trước.`);
                picker.click();
            }
            return;
        }
        if (action === "default-bank") {
            router.push("/account/bank/default");
            return;
        }
        if (action === "bank-details") {
            const card = button.closest("article") ?? button.closest("[data-purpose='bank-card']");
            setModal({
                kind: "info",
                title: "Thông tin tài khoản ngân hàng",
                body: (card?.querySelector("h3")?.textContent?.trim() || "Tài khoản đã liên kết") + " — Thông tin nhận chi trả được mã hóa. Bạn có thể chỉnh sửa hoặc chọn làm tài khoản mặc định."
            });
            return;
        }
        if (action === "preview-image") {
            const scope = button.closest("[id^='card-']") ?? button.closest("section") ?? root.current;
            const img = button.parentElement?.querySelector("img") ?? scope?.querySelector("img");
            if (img) setModal({
                kind: "image",
                title: img.alt || "Ảnh đối chiếu",
                image: img.src
            });
            else notify("Chưa có ảnh đối chiếu cho mục này.");
            return;
        }
        if (action === "remove-bank") {
            setModal({
                kind: "info",
                title: "Gỡ liên kết tài khoản",
                body: "Tài khoản mẫu đã được gỡ liên kết trong phiên xem trước."
            });
            return;
        }
        if (action === "handover" || /Xác nhận của tôi/.test(text) && path === "/handover/pickup") {
            notify("Đã xác nhận biên bản nhận xe.");
            router.push("/my-trips");
            return;
        }
        if (action === "return" || /Xác nhận của tôi/.test(text) && path === "/handover/return") {
            notify("Đã xác nhận biên bản trả xe.");
            router.push("/reviews");
            return;
        }
        if (path.includes("/bank/") && /Hủy|Đóng/.test(text)) {
            router.push("/account/bank");
            return;
        }
        if (path.endsWith("bank/default") && /Xác nhận|Lưu/.test(text)) {
            notify("Đã đổi tài khoản mặc định.");
            router.push("/account/bank");
            return;
        }
        if (/Lưu bản nháp/.test(text)) {
            notify("Đã lưu bản nháp biên bản.");
            return;
        }
        if (button.tagName === "A") return;
        if (/Quay lại|Trở về/.test(text)) {
            router.push("/my-trips");
            return;
        }
        if (/Áp dụng/.test(text)) {
            notify("Đã áp dụng mã ưu đãi.");
            return;
        }
        if (/Chọn|Thêm|Xác nhận|Lưu/.test(text)) {
            activate(button);
            notify("Đã cập nhật lựa chọn.");
        }
    }
    const value = (id)=>document.getElementById(id)?.value ?? "";
    async function submitLogin(form) {
        const email = value("login-account").trim();
        const password = value("login-password");
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            notify("Vui lòng nhập email đã đăng ký (hệ thống đăng nhập bằng email).");
            return;
        }
        if (!password) {
            notify("Vui lòng nhập mật khẩu.");
            return;
        }
        form.setAttribute("aria-busy", "true");
        try {
            const session = await login({
                email,
                password
            });
            notify(`Xin chào ${session.account.fullName}!`);
            const next = new URLSearchParams(window.location.search).get("next");
            router.push(next && next.startsWith("/") ? next : session.account.role === "ADMIN" ? "/admin/dashboard" : "/explore");
        } catch (error) {
            notify(error.status === 401 ? "Email hoặc mật khẩu không đúng." : error.message);
        } finally{
            form.removeAttribute("aria-busy");
        }
    }
    async function submitRegister(form) {
        const payload = {
            fullName: value("reg-fullname"),
            email: value("reg-email"),
            phone: value("reg-phone"),
            password: value("reg-password")
        };
        if (!payload.fullName.trim() || !payload.email.trim() || !payload.phone.trim() || !payload.password) {
            notify("Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu.");
            return;
        }
        if (payload.password !== value("reg-confirm-password")) {
            notify("Mật khẩu xác nhận chưa khớp.");
            return;
        }
        form.setAttribute("aria-busy", "true");
        try {
            await register(payload);
            await login({
                email: payload.email,
                password: payload.password
            });
            notify("Tạo tài khoản thành công. Chào mừng bạn đến với CarDB!");
            router.push("/account");
        } catch (error) {
            notify(error.message);
        } finally{
            form.removeAttribute("aria-busy");
        }
    }
    function submit(event) {
        if (event.target.closest?.("[data-native]")) return;
        event.preventDefault();
        const form = event.target;
        if (path === "/login") {
            void submitLogin(form);
            return;
        }
        if (path === "/register") {
            void submitRegister(form);
            return;
        }
        if (path.includes("/bank/")) {
            try {
                localStorage.setItem("cardb:bank:v1", JSON.stringify({
                    name: form.querySelector('#bank-name')?.value,
                    number: form.querySelector('#account-number')?.value
                }));
            } catch  {}
            notify("Đã lưu tài khoản ngân hàng mẫu.");
            router.push("/account/bank");
            return;
        }
        if (path === "/booking/confirm") {
            router.push("/booking/success");
            return;
        }
        notify("Đã lưu thông tin trong bản xem trước.");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: root,
        onClick: click,
        onSubmit: submit,
        onInput: (event)=>{
            const el = event.target;
            if ([
                "review-content",
                "dispute-detail"
            ].includes(el.id)) setText("char-counter", `${el.value.length}/1000`);
        },
        onChange: (event)=>{
            const el = event.target;
            if (el.type === "file") notify(`Đã chọn ${el.files?.length ?? 0} tệp.`);
        },
        onKeyDown: (event)=>{
            const el = event.target;
            if (el.getAttribute("role") === "button" && [
                "Enter",
                " "
            ].includes(event.key)) {
                event.preventDefault();
                el.click();
            }
            if (event.key === "Escape" && path.includes("/bank/")) router.push("/account/bank");
        },
        children: [
            children,
            empty ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "mx-auto my-4 max-w-xl rounded-lg border border-border-light bg-white p-6 text-center text-text-secondary",
                children: path === "/explore" ? "Chưa có xe phù hợp. Hãy thử xóa hoặc thay đổi bộ lọc." : "Chưa có chuyến xe ở trạng thái này."
            }, void 0, false, {
                fileName: "[project]/src/components/interactions.jsx",
                lineNumber: 510,
                columnNumber: 12
            }, this) : null,
            toast ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "status",
                className: "toast fixed inset-x-4 bottom-5 z-[150] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-border-light bg-text-primary px-5 py-4 text-sm text-white shadow-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                        name: "check_circle",
                        className: "text-[20px] text-brand-accent"
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 511,
                        columnNumber: 237
                    }, this),
                    toast,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        "aria-label": "Đóng thông báo",
                        onClick: ()=>setToast(""),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                            name: "close",
                            className: "text-[18px]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/interactions.jsx",
                            lineNumber: 511,
                            columnNumber: 392
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 511,
                        columnNumber: 313
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/interactions.jsx",
                lineNumber: 511,
                columnNumber: 12
            }, this) : null,
            modal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Modal, {
                title: modal.title,
                close: ()=>setModal(null),
                children: [
                    modal.kind === "image" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: modal.image,
                        alt: modal.title,
                        className: "max-h-[70vh] w-full rounded-lg object-contain"
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 512,
                        columnNumber: 94
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm leading-7 text-text-secondary",
                        children: modal.body
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 512,
                        columnNumber: 197
                    }, this),
                    modal.kind === "cancel" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hold$2d$button$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HoldButton"], {
                            danger: true,
                            onComplete: ()=>{
                                setModal(null);
                                router.push("/my-trips?cancelled=1");
                                notify("Đã hủy yêu cầu thuê xe.");
                            },
                            children: "Giữ để hủy đặt xe"
                        }, void 0, false, {
                            fileName: "[project]/src/components/interactions.jsx",
                            lineNumber: 512,
                            columnNumber: 316
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 512,
                        columnNumber: 294
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/interactions.jsx",
                lineNumber: 512,
                columnNumber: 12
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/interactions.jsx",
        lineNumber: 498,
        columnNumber: 12
    }, this);
}
_s1(Interactions, "FSxvH/YVri7AjIkt2E8TvYjhD1E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c1 = Interactions;
var _c, _c1;
__turbopack_context__.k.register(_c, "Modal");
__turbopack_context__.k.register(_c1, "Interactions");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/site-brand.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SiteBrand",
    ()=>SiteBrand
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
;
function SiteBrand({ onClick, compact = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: "/",
        "aria-label": "CarDB — Trang chủ",
        onClick: onClick,
        className: "inline-flex shrink-0 items-center gap-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-2xl font-black tracking-tight text-text-primary",
                children: [
                    "Car",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-brand-accent",
                        children: "DB"
                    }, void 0, false, {
                        fileName: "[project]/src/components/site-brand.jsx",
                        lineNumber: 4,
                        columnNumber: 79
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/site-brand.jsx",
                lineNumber: 4,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `ml-2 flex-col border-l border-border-light pl-3 text-[9px] font-semibold uppercase leading-none tracking-wider text-text-secondary ${compact ? "hidden sm:flex" : "flex"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] font-bold tracking-widest",
                        children: "Di chuyển"
                    }, void 0, false, {
                        fileName: "[project]/src/components/site-brand.jsx",
                        lineNumber: 6,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "mt-1",
                        children: "Cao cấp"
                    }, void 0, false, {
                        fileName: "[project]/src/components/site-brand.jsx",
                        lineNumber: 6,
                        columnNumber: 79
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/site-brand.jsx",
                lineNumber: 5,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/site-brand.jsx",
        lineNumber: 3,
        columnNumber: 12
    }, this);
}
_c = SiteBrand;
var _c;
__turbopack_context__.k.register(_c, "SiteBrand");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/labels.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FALLBACK_CAR_IMAGE",
    ()=>FALLBACK_CAR_IMAGE,
    "carImage",
    ()=>carImage,
    "carName",
    ()=>carName,
    "carTypeLabels",
    ()=>carTypeLabels,
    "disputeStatusLabels",
    ()=>disputeStatusLabels,
    "docTypeLabels",
    ()=>docTypeLabels,
    "formatMoney",
    ()=>formatMoney,
    "fuelTypeLabels",
    ()=>fuelTypeLabels,
    "handoverTypeLabels",
    ()=>handoverTypeLabels,
    "initials",
    ()=>initials,
    "kycStatusLabels",
    ()=>kycStatusLabels,
    "orderStatusLabels",
    ()=>orderStatusLabels,
    "orderStatusTone",
    ()=>orderStatusTone,
    "paymentMethodLabels",
    ()=>paymentMethodLabels,
    "paymentStatusLabels",
    ()=>paymentStatusLabels,
    "rentalTypeLabels",
    ()=>rentalTypeLabels,
    "toNumber",
    ()=>toNumber,
    "transactionStatusLabels",
    ()=>transactionStatusLabels,
    "transactionTypeLabels",
    ()=>transactionTypeLabels,
    "transmissionLabels",
    ()=>transmissionLabels,
    "verifyStatusLabels",
    ()=>verifyStatusLabels
]);
const vnd = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0
});
function toNumber(value) {
    if (value === null || value === undefined || value === "") return 0;
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : 0;
}
const formatMoney = (value)=>`${vnd.format(Math.round(toNumber(value)))} đ`;
const carTypeLabels = {
    SEDAN: "Sedan",
    HATCHBACK: "Hatchback",
    SUV: "SUV",
    MPV: "MPV",
    PICKUP: "Bán tải",
    LUXURY: "Hạng sang",
    OTHER: "Khác"
};
const fuelTypeLabels = {
    GASOLINE: "Xăng",
    DIESEL: "Dầu",
    ELECTRIC: "Điện",
    HYBRID: "Hybrid"
};
const transmissionLabels = {
    AUTOMATIC: "Số tự động",
    MANUAL: "Số sàn"
};
const rentalTypeLabels = {
    HOURLY: "Theo giờ",
    DAILY: "Theo ngày",
    BOTH: "Giờ & ngày"
};
const orderStatusLabels = {
    PENDING: "Chờ chủ xe xác nhận",
    CONFIRMED: "Đã xác nhận",
    REJECTED: "Bị từ chối",
    EXPIRED: "Hết hạn",
    ONGOING: "Đang thuê",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy"
};
const orderStatusTone = {
    PENDING: "bg-[#FEF3C7] text-[#B45309]",
    CONFIRMED: "bg-[#DBEAFE] text-[#1D4ED8]",
    REJECTED: "bg-[#FEE2E2] text-[#B91C1C]",
    EXPIRED: "bg-[#F0F1EF] text-[#666666]",
    ONGOING: "bg-[#CCFBF1] text-[#0F766E]",
    COMPLETED: "bg-[#D1FAE5] text-[#047857]",
    CANCELLED: "bg-[#FEE2E2] text-[#B91C1C]"
};
const paymentStatusLabels = {
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    REFUNDED: "Đã hoàn tiền"
};
const transactionStatusLabels = {
    PENDING: "Đang chờ",
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    CANCELLED: "Đã hủy"
};
const transactionTypeLabels = {
    DEPOSIT: "Tiền cọc",
    RENTAL_PAYMENT: "Tiền thuê",
    EXTRA_FEE: "Phụ phí",
    REFUND: "Hoàn tiền"
};
const paymentMethodLabels = {
    VNPAY: "VNPay",
    MOMO: "MoMo",
    BANK_TRANSFER: "Chuyển khoản",
    CASH: "Tiền mặt"
};
const kycStatusLabels = {
    NONE: "Chưa xác minh",
    PENDING: "Đang xét duyệt",
    VERIFIED: "Đã xác minh",
    REJECTED: "Bị từ chối"
};
const verifyStatusLabels = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Bị từ chối"
};
const docTypeLabels = {
    CITIZEN_ID: "CCCD / CMND",
    DRIVER_LICENSE: "Giấy phép lái xe",
    PASSPORT: "Hộ chiếu"
};
const disputeStatusLabels = {
    OPEN: "Mới mở",
    IN_REVIEW: "Đang xem xét",
    RESOLVED: "Đã giải quyết",
    REJECTED: "Bác bỏ"
};
const handoverTypeLabels = {
    PICKUP: "Nhận xe",
    RETURN: "Trả xe"
};
function carName(item) {
    if (!item) return "Xe";
    if (item.carName) return item.carName;
    return [
        item.brand,
        item.model
    ].filter(Boolean).join(" ") || "Xe";
}
function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
const FALLBACK_CAR_IMAGE = "/images/cardb-02d5cb41aa8f9514.webp";
function carImage(item) {
    if (!item) return FALLBACK_CAR_IMAGE;
    if (item.primaryImageUrl) return item.primaryImageUrl;
    const images = Array.isArray(item.images) ? item.images : [];
    const primary = images.find((image)=>image.isPrimary || image.primary) ?? images[0];
    return primary?.imageUrl || FALLBACK_CAR_IMAGE;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/session.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSession",
    ()=>clearSession,
    "currentUserId",
    ()=>currentUserId,
    "readSession",
    ()=>readSession,
    "saveSession",
    ()=>saveSession,
    "subscribeSession",
    ()=>subscribeSession,
    "updateSessionAccount",
    ()=>updateSessionAccount
]);
const STORAGE_KEY = "cardb:session:v2";
const EVENT = "cardb:session-change";
function canUseStorage() {
    return ("TURBOPACK compile-time value", "object") !== "undefined" && typeof window.localStorage !== "undefined";
}
function readSession() {
    if (!canUseStorage()) return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session?.accessToken || !session?.account?.id) return null;
        if (session.expiresAt && Date.now() >= session.expiresAt) {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return session;
    } catch  {
        return null;
    }
}
function saveSession(tokenResponse) {
    const session = {
        accessToken: tokenResponse.accessToken,
        tokenType: tokenResponse.tokenType || "Bearer",
        expiresAt: tokenResponse.expiresIn ? Date.now() + Number(tokenResponse.expiresIn) * 1000 : null,
        account: tokenResponse.account
    };
    if (canUseStorage()) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        window.dispatchEvent(new Event(EVENT));
    }
    return session;
}
function updateSessionAccount(patch) {
    const session = readSession();
    if (!session || !canUseStorage()) return;
    session.account = {
        ...session.account,
        ...patch
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event(EVENT));
}
function clearSession() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT));
}
function subscribeSession(listener) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const onStorage = (event)=>{
        if (event.key === null || event.key === STORAGE_KEY) listener();
    };
    window.addEventListener(EVENT, listener);
    window.addEventListener("storage", onStorage);
    return ()=>{
        window.removeEventListener(EVENT, listener);
        window.removeEventListener("storage", onStorage);
    };
}
function currentUserId() {
    return readSession()?.account?.id ?? null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/auth.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "changePassword",
    ()=>changePassword,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "register",
    ()=>register
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/http.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.js [app-client] (ecmascript)");
;
;
async function login({ email, password }) {
    const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["request"])("/api/auth/login", {
        method: "POST",
        auth: false,
        json: {
            email: email.trim(),
            password
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveSession"])(token);
}
function register({ fullName, email, phone, password }) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["request"])("/api/auth/register", {
        method: "POST",
        auth: false,
        json: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim().replace(/\s+/g, ""),
            password
        }
    });
}
function changePassword({ currentPassword, newPassword }) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["request"])("/api/auth/change-password", {
        method: "POST",
        json: {
            currentPassword,
            newPassword
        }
    });
}
function logout() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearSession"])();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/http.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "USE_MOCK_API",
    ()=>USE_MOCK_API,
    "fetchAllPages",
    ()=>fetchAllPages,
    "jsonBody",
    ()=>jsonBody,
    "mockResponse",
    ()=>mockResponse,
    "request",
    ()=>request,
    "toPage",
    ()=>toPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.js [app-client] (ecmascript)");
;
/**
 * Mặc định gọi cùng origin `/api/...`; Next.js rewrite (next.config.mjs) chuyển tiếp sang backend.
 * Đặt `NEXT_PUBLIC_API_URL` nếu muốn gọi thẳng backend (khi đó backend phải mở CORS cho header X-User-Id).
 */ const API_BASE_URL = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const USE_MOCK_API = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_USE_MOCK_API === "true";
class ApiError extends Error {
    status;
    code;
    fieldErrors;
    constructor(status, message, code, fieldErrors = []){
        super(message);
        this.status = status;
        this.code = code;
        this.fieldErrors = fieldErrors;
        this.name = "ApiError";
    }
}
function buildQuery(query) {
    if (!query) return "";
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)){
        if (value === undefined || value === null || value === "") continue;
        if (Array.isArray(value)) value.forEach((item)=>params.append(key, String(item)));
        else params.append(key, String(value));
    }
    const text = params.toString();
    return text ? `?${text}` : "";
}
const statusMessages = {
    400: "Dữ liệu gửi lên không hợp lệ.",
    401: "Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập.",
    403: "Bạn không có quyền thực hiện thao tác này.",
    404: "Không tìm thấy dữ liệu yêu cầu.",
    409: "Dữ liệu đã thay đổi hoặc bị trùng, vui lòng tải lại.",
    500: "Máy chủ gặp lỗi, vui lòng thử lại sau."
};
function errorFromBody(status, body) {
    const fieldErrors = Array.isArray(body?.errors) ? body.errors : [];
    const detail = fieldErrors.map((item)=>item?.message).filter(Boolean);
    const base = body?.message || body?.error || statusMessages[status] || `Lỗi ${status}`;
    const message = detail.length && !detail.includes(base) ? `${base}: ${detail.join("; ")}` : base;
    return new ApiError(status, message, body?.code, fieldErrors);
}
function unwrap(body) {
    if (body && typeof body === "object" && !Array.isArray(body) && "data" in body && ("success" in body || "status" in body || "message" in body)) return body.data;
    return body;
}
async function request(path, init = {}) {
    const { json, query, auth = true, headers: extraHeaders, ...rest } = init;
    const headers = {
        Accept: "application/json",
        ...extraHeaders
    };
    let body = rest.body;
    if (json !== undefined) {
        body = JSON.stringify(json);
        headers["Content-Type"] = "application/json";
    } else if (typeof body === "string" && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }
    const session = auth ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["readSession"])() : null;
    if (session) {
        headers.Authorization = `${session.tokenType || "Bearer"} ${session.accessToken}`;
        headers["X-User-Id"] = String(session.account.id);
    }
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
            ...rest,
            body,
            headers
        });
    } catch  {
        throw new ApiError(0, "Không kết nối được tới máy chủ backend. Kiểm tra backend đã chạy ở cổng 8080 chưa.");
    }
    const contentType = response.headers.get("content-type") || "";
    let payload;
    if (response.status !== 204) {
        if (contentType.includes("json")) {
            try {
                payload = await response.json();
            } catch  {
                payload = undefined;
            }
        } else {
            const text = await response.text();
            payload = text ? {
                message: text.length > 300 ? undefined : text
            } : undefined;
        }
    }
    if (!response.ok) {
        if (response.status === 401 && session) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearSession"])();
        if (response.status >= 500 && !payload?.message) throw new ApiError(response.status, response.status === 502 || response.status === 503 || response.status === 504 ? "Không kết nối được tới máy chủ backend. Kiểm tra backend đã chạy chưa." : statusMessages[500]);
        throw errorFromBody(response.status, payload);
    }
    return unwrap(payload);
}
const jsonBody = (value)=>JSON.stringify(value);
function mockResponse(value, delayMs = 200) {
    return new Promise((resolve)=>setTimeout(()=>resolve(structuredClone(value)), delayMs));
}
function toPage(data) {
    if (Array.isArray(data)) return {
        content: data,
        page: 0,
        size: data.length,
        totalElements: data.length,
        totalPages: 1
    };
    const content = data?.content ?? data?.items ?? [];
    return {
        content,
        page: data?.page ?? data?.number ?? 0,
        size: data?.size ?? content.length,
        totalElements: data?.totalElements ?? content.length,
        totalPages: data?.totalPages ?? 1
    };
}
async function fetchAllPages(path, query = {}, { pageSize = 100, maxPages = 20 } = {}) {
    const all = [];
    for(let page = 0; page < maxPages; page += 1){
        const result = toPage(await request(path, {
            query: {
                ...query,
                page,
                size: pageSize
            }
        }));
        all.push(...result.content);
        if (page + 1 >= result.totalPages || result.content.length === 0) break;
    }
    return all;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]})(),
"[project]/node_modules/next/navigation.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_0lls5pe4-2jsc._.js.map