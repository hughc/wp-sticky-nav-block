import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	SelectControl,
} from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
	const { tagsList, excludeClass, menuTag, scrollToOffset, headerText, collapsible } = attributes;

	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title="Block Settings">
					<TextControl
						label="Header Text"
						value={headerText}
						onChange={(val) => setAttributes({ headerText: val })}
					/>
					<SelectControl
						label="Menu Tag"
						value={menuTag}
						options={[
							{ label: 'Unordered (ul)', value: 'ul' },
							{ label: 'Ordered (ol)', value: 'ol' },
						]}
						onChange={(val) => setAttributes({ menuTag: val })}
					/>
					<TextControl
						label="Tags List (comma-separated, e.g. h2, h3)"
						value={tagsList}
						onChange={(val) => setAttributes({ tagsList: val })}
					/>
					<TextControl
						label="Exclude Class"
						value={excludeClass}
						onChange={(val) => setAttributes({ excludeClass: val })}
					/>
					<TextControl
						label="Scroll-to Offset (px)"
						type="number"
						value={scrollToOffset}
						onChange={(val) => setAttributes({ scrollToOffset: parseInt(val, 10) || 0 })}
					/>
					<ToggleControl
						label="Collapsible (mobile)"
						checked={collapsible}
						onChange={(val) => setAttributes({ collapsible: val })}
					/>
				</PanelBody>
			</InspectorControls>
			<div {...blockProps}>
				<h2>{headerText || 'Table of Contents'}</h2>
				<p>Sticky Nav Block — renders on the front end.</p>
			</div>
		</>
	);
}
