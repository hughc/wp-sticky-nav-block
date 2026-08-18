/**
 * Sticky Nav Block — Editor
 * Uses wp.* globals (WordPress loads these on the editor page).
 */
(function (wp) {
	'use strict';

	var registerBlockType = wp.blocks.registerBlockType;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var SelectControl = wp.components.SelectControl;
	var ToggleControl = wp.components.ToggleControl;
	var el = wp.element.createElement;

	registerBlockType('rav/sticky-nav-block', {
		title: 'Sticky Nav Block',
		category: 'widgets',
		icon: 'list-view',
		attributes: {
			scrollToOffset: { type: 'number', default: 0 },
			tagsList: { type: 'string', default: 'h2' },
			excludeClass: { type: 'string', default: '' },
			menuTag: { type: 'string', enum: ['ul', 'ol'], default: 'ul' },
			headerText: { type: 'string', default: 'Table of Contents' },
			collapsible: { type: 'boolean', default: false },
			topOffset: { type: 'number', default: 80 },
			showAfterScroll: { type: 'number', default: 0 },
			desktopBreakpoint: { type: 'number', default: 768 },
			collapseBreakpoint: { type: 'number', default: 1200 },
			panelWidth: { type: 'number', default: 280 },
		},
		edit: function (props) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps();

			return el(
				'fragment',
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: 'Content', initialOpen: true },
						el(TextControl, {
							label: 'Header Text',
							value: attributes.headerText,
							onChange: function (val) { setAttributes({ headerText: val }); },
						}),
						el(SelectControl, {
							label: 'Menu Tag',
							value: attributes.menuTag,
							options: [
								{ label: 'Unordered (ul)', value: 'ul' },
								{ label: 'Ordered (ol)', value: 'ol' },
							],
							onChange: function (val) { setAttributes({ menuTag: val }); },
						}),
						el(TextControl, {
							label: 'Tags List (comma-separated, e.g. h2, h3)',
							value: attributes.tagsList,
							onChange: function (val) { setAttributes({ tagsList: val }); },
						}),
						el(TextControl, {
							label: 'Exclude Class',
							value: attributes.excludeClass,
							onChange: function (val) { setAttributes({ excludeClass: val }); },
						})
					),
					el(
						PanelBody,
						{ title: 'Behaviour', initialOpen: false },
						el(TextControl, {
							label: 'Scroll-to Offset (px)',
							type: 'number',
							value: attributes.scrollToOffset,
							onChange: function (val) { setAttributes({ scrollToOffset: parseInt(val, 10) || 0 }); },
						}),
						el(TextControl, {
							label: 'Top Offset (px)',
							type: 'number',
							value: attributes.topOffset,
							onChange: function (val) { setAttributes({ topOffset: parseInt(val, 10) || 80 }); },
						}),
						el(TextControl, {
							label: 'Show After Scroll (px, 0 = always)',
							type: 'number',
							value: attributes.showAfterScroll,
							onChange: function (val) { setAttributes({ showAfterScroll: parseInt(val, 10) || 0 }); },
						}),
						el(ToggleControl, {
							label: 'Collapsible (mobile)',
							checked: attributes.collapsible,
							onChange: function (val) { setAttributes({ collapsible: val }); },
						}),
						el(TextControl, {
							label: 'Desktop Breakpoint (px)',
							type: 'number',
							value: attributes.desktopBreakpoint,
							onChange: function (val) { setAttributes({ desktopBreakpoint: parseInt(val, 10) || 768 }); },
						}),
						el(TextControl, {
							label: 'Collapse Breakpoint (px)',
							type: 'number',
							value: attributes.collapseBreakpoint,
							onChange: function (val) { setAttributes({ collapseBreakpoint: parseInt(val, 10) || 1200 }); },
						})
					),
					el(
						PanelBody,
						{ title: 'Style', initialOpen: false },
						el(TextControl, {
							label: 'Panel Width (px)',
							type: 'number',
							value: attributes.panelWidth,
							onChange: function (val) { setAttributes({ panelWidth: parseInt(val, 10) || 280 }); },
						})
					)
				),
				el('div', blockProps,
					el('h2', null, attributes.headerText || 'Table of Contents'),
					el('p', null, 'Sticky Nav Block — renders on the front end.')
				)
			);
		},
		save: function () {
			return null;
		},
	});
})(window.wp);
