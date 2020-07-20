<?php
/**
 * View template.
 *
 * @package Advanced_Posts_Blocks
 *
 * @var string $class_name
 * @var WP_Query $query
 * @var array $args {
 *     @type string $class_name
 *     @type WP_Query $query
 * }
 */

?>
<div class="wp-block-advanced-posts-block-posts <?php echo esc_attr( $class_name ); ?>">
	<?php if ( $query->have_posts() ) : ?>
		<?php while ( $query->have_posts() ) : ?>
			<?php $query->the_post(); ?>

			<a href="<?php the_permalink(); ?>">
				<article>
					<h4><?php the_title(); ?></h4>
					<?php the_excerpt(); ?>
				</article>
			</a>

		<?php endwhile; ?>
		<?php wp_reset_postdata(); ?>
	<?php endif; ?>
</div>
