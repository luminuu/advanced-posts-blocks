<?php
/**
 * Posts Renderer Class.
 *
 * @package Advanced_Posts_Blocks
 */

namespace Advanced_Posts_Blocks\Blocks\Children;

/**
 * Class Renderer
 *
 * Posts blocks.
 */
class Renderer extends \Advanced_Posts_Blocks\Blocks\Renderer {

	/**
	 * Path to the block.json dir.
	 *
	 * @var string
	 */
	protected $dir = __DIR__;

	/**
	 * Name of Block.
	 *
	 * @var string
	 */
	protected $name = 'advanced-posts-blocks/children';

	protected function register() {
		register_block_type(
			'advanced-posts-blocks/children',
			$this->register_block_type_arguments()
		);
	}

	/**
	 * Render callback
	 *
	 * @param array $attributes block attributes.
	 *
	 * @return false|string
	 */
	public function render( $attributes ) {
		$args = [
			'posts_per_page' => $attributes['postsToShow'],
			'post_status'    => 'publish',
			'post_parent'    => $attributes['postId'] ? $attributes['postId'] : get_the_ID(),
			'order'          => $attributes['order'],
			'orderby'        => $attributes['orderBy'],
			'post_type'      => $attributes['postType'] ? $attributes['postType'] : get_post_type(),
		];

		$this->setup_query( $args );

		$output = $this->get_content_from_template( $attributes );
		if ( $output ) {
			return $output;
		}

		$output = $this->get_content_from_default_template( $this->name );

		return $output;
	}
}
