<?php

/**
 * Plugin Name:       Sticky Nav Block
 * Description:       A Gutenberg block that renders a navigational menu / ToC with smooth scroll and scrollspy.
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Highbrow Interactive
 * Author URI:        https://highbrow.com.au
 * GitHub Plugin URI: https://github.com/hughc/wp-sticky-nav-block
 * Text Domain:       sticky-nav-block
 */

if (! defined('ABSPATH')) {
	exit;
}

define('SNB_PATH', plugin_dir_path(__FILE__));
define('SNB_URL', plugin_dir_url(__FILE__));

/**
 * Register the block server-side.
 */
function snb_register_block()
{
	register_block_type(
		SNB_PATH,
		array(
			'render_callback' => 'snb_render_block',
		)
	);

	// Hook the_content at max priority to process headings after all other filters.
	add_filter('the_content', 'snb_the_content_filter', PHP_INT_MAX);
}
add_action('init', 'snb_register_block');

/**
 * Global config set by the block render callback, read by the_content filter.
 */
$snb_config = null;

/**
 * Render the block output on the front end.
 * Does NOT process content — just outputs the menu structure.
 *
 * @param array $attributes Block attributes.
 * @return string
 */
function snb_render_block($attributes)
{
	$tags         = isset($attributes['tagsList']) ? array_map('trim', explode(',', $attributes['tagsList'])) : array('h2');
	$exclude      = isset($attributes['excludeClass']) && ! empty($attributes['excludeClass']) ? trim($attributes['excludeClass']) : '';
	$menu_tag     = isset($attributes['menuTag']) && $attributes['menuTag'] === 'ol' ? 'ol' : 'ul';
	$header_text  = isset($attributes['headerText']) && ! empty($attributes['headerText']) ? $attributes['headerText'] : 'Table of Contents';
	$collapsible  = isset($attributes['collapsible']) ? (bool) $attributes['collapsible'] : false;
	$offset       = isset($attributes['scrollToOffset']) ? (int) $attributes['scrollToOffset'] : 0;
	$top_offset   = isset($attributes['topOffset']) ? (int) $attributes['topOffset'] : 80;
	$show_after   = isset($attributes['showAfterScroll']) ? (int) $attributes['showAfterScroll'] : 0;
	$desktop_bp   = isset($attributes['desktopBreakpoint']) ? (int) $attributes['desktopBreakpoint'] : 768;
	$collapse_bp  = isset($attributes['collapseBreakpoint']) ? (int) $attributes['collapseBreakpoint'] : 1200;
	$panel_width  = isset($attributes['panelWidth']) ? (int) $attributes['panelWidth'] : 280;

	// Store config for the_content filter to pick up.
	global $snb_config;
	$snb_config = array(
		'tags'       => $tags,
		'exclude'    => $exclude,
		'menu_tag'   => $menu_tag,
		'headings'   => null, // Will be populated by the_content filter.
	);

	$classes = array('snb-block');
	if ($collapsible) {
		$classes[] = 'snb-block--collapsible';
	}

	ob_start();
?>
	<div class="<?php echo esc_attr(implode(' ', $classes)); ?>"
		data-snb
		data-offset="<?php echo esc_attr($offset); ?>"
		data-show-after="<?php echo esc_attr($show_after); ?>"
		data-desktop-bp="<?php echo esc_attr($desktop_bp); ?>"
		data-collapse-bp="<?php echo esc_attr($collapse_bp); ?>"
		style="--snb-top: <?php echo esc_attr($top_offset); ?>px; --snb-width: <?php echo esc_attr($panel_width); ?>px;">
		<div class="snb-block__header">
			<span class="snb-block__title"><?php echo esc_html($header_text); ?></span>
			<button class="snb-block__collapse-btn" aria-expanded="true" type="button" aria-label="Toggle table of contents">
				<span class="snb-block__icon snb-block__icon--open" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 12h18" />
						<path d="M3 6h18" />
						<path d="M3 18h18" />
					</svg>
				</span>
				<span class="snb-block__icon snb-block__icon--close" aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</span>
			</button>
			<?php if ($collapsible) : ?>
				<button class="snb-block__toggle" aria-expanded="true" type="button">
					<span class="snb-block__toggle-icon"></span>
				</button>
			<?php endif; ?>
		</div>
		<div class="snb-block__body">
			<!-- Menu rendered by the_content filter -->
		</div>
	</div>
<?php
	return ob_get_clean();
}

/**
 * the_content filter: processes headings, injects IDs, replaces the block's
 * placeholder body with the actual menu markup.
 *
 * @param string $content Filtered post content.
 * @return string
 */
function snb_the_content_filter($content)
{
	global $snb_config;
	if (! $snb_config || ! class_exists('WP_HTML_Tag_Processor')) {
		return $content;
	}

	$tags    = $snb_config['tags'];
	$exclude = $snb_config['exclude'];
	$menu_tag = $snb_config['menu_tag'];

	// Process headings: extract info and inject IDs.
	$result = snb_process_content($content, $tags, $exclude);

	if (empty($result['headings'])) {
		$snb_config = null;
		return $content;
	}

	// Build the menu HTML.
	$menu_html = snb_build_menu($result['headings'], $menu_tag);

	// Replace the block's empty body with the menu.
	// The block outputs <div class="snb-block ...">...<div class="snb-block__body"><!-- Menu rendered --></div></div>
	$pattern = '/(<div[^>]*class="[^"]*snb-block__body[^"]*"[^>]*>)\s*<!-- Menu rendered by the_content filter -->\s*(<\/div>)/';
	$replacement = '$1' . $menu_html . '$2';
	$updated = preg_replace($pattern, $replacement, $result['html'], 1);

	$snb_config['headings'] = $result['headings'];
	$snb_config = null; // Clear so it only runs once per page.

	return $updated ? $updated : $content;
}

/**
 * Process rendered HTML: extract heading info and inject IDs.
 *
 * @param string $content Rendered HTML.
 * @param array  $tags    Heading tags to look for.
 * @param string $exclude Class to skip.
 * @return array{headings: array, html: string}
 */
function snb_process_content($content, $tags, $exclude = '')
{
	$headings = array();
	$allowed_tags = array_map('strtoupper', $tags);
	$processor = new WP_HTML_Tag_Processor($content);
	$counter = 0;

	// Walk every tag in document order; filter by our allowed list.
	while ($processor->next_tag()) {
		$tag_name = $processor->get_tag();
		if (! $tag_name || ! in_array($tag_name, $allowed_tags, true)) {
			continue;
		}

		$class_attr = $processor->get_attribute('class');
		if ($exclude && $class_attr && preg_match('/\b' . preg_quote($exclude, '/') . '\b/', $class_attr)) {
			continue;
		}

		$counter++;
		$tag = strtolower($tag_name);
		$existing_id = $processor->get_attribute('id');

		// Bookmark, read text, seek back.
		$processor->set_bookmark('snb_h');
		$processor->next_token();
		$text = trim($processor->get_modifiable_text());
		$processor->seek('snb_h');
		$processor->release_bookmark('snb_h');

		if ($existing_id) {
			$id = $existing_id;
		} else {
			$id = sanitize_title($text);
			if (empty($id)) {
				$id = 'snb-heading-' . $counter;
			}
			$processor->set_attribute('id', $id);
		}

		$headings[] = array(
			'tag'  => $tag,
			'id'   => $id,
			'text' => $text,
		);
	}

	return array(
		'headings' => $headings,
		'html'     => $processor->get_updated_html(),
	);
}

/**
 * Build the nested menu HTML.
 *
 * @param array  $headings Parsed headings.
 * @param string $tag      Menu tag (ul or ol).
 * @return string
 */
function snb_build_menu($headings, $tag)
{
	if (empty($headings)) {
		return '';
	}

	ob_start();
	echo '<' . esc_attr($tag) . ' class="snb-block__list">';
	snb_render_heading_items($headings, 0, $tag);
	echo '</' . esc_attr($tag) . '>';
	return ob_get_clean();
}

/**
 * Recursively render heading items with nesting.
 *
 * @param array  $headings All headings.
 * @param int    $index    Current index.
 * @param string $tag      Child menu tag.
 */
function snb_render_heading_items($headings, $index, $tag)
{
	if ($index >= count($headings)) {
		return;
	}

	$current   = $headings[$index];
	$next_tag  = isset($headings[$index + 1]) ? $headings[$index + 1]['tag'] : null;

	echo '<li class="snb-block__item">';
	echo '<a class="snb-block__link" href="#' . esc_attr($current['id']) . '" data-snb-link data-target="' . esc_attr($current['id']) . '">';
	echo esc_html($current['text']);
	echo '</a>';

	if ($next_tag && $next_tag !== $current['tag']) {
		echo '<' . esc_attr($tag) . ' class="snb-block__list snb-block__list--nested">';
		snb_render_heading_items($headings, $index + 1, $tag);
		echo '</' . esc_attr($tag) . '>';
	} elseif ($next_tag === null) {
		// End of list.
	} else {
		snb_render_heading_items($headings, $index + 1, $tag);
	}

	echo '</li>';
}
