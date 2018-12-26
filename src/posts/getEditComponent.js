/**
 * External dependencies
 */
import { isUndefined, pickBy } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Fragment } from '@wordpress/element';
import {
	PanelBody,
	Placeholder,
	Spinner,
} from '@wordpress/components';
import QueryControls from './QueryControls';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	ServerSideRender,
} from '@wordpress/editor';
import { withSelect } from '@wordpress/data';
import TermsControls from './TermsControls';

/**
 * Module Constants
 */
const TERM_LIST_QUERY = {
	per_page: - 1,
};

const getEditComponent = ( blockName, postType ) => {

	return withSelect( ( select, props ) => {
		const { attributes } = props;
		const { postsToShow, order, orderBy } = attributes;
		const { getEntityRecords, getTaxonomies } = select( 'core' );

		let taxonomies = getTaxonomies();
		if ( taxonomies ) {
			taxonomies = taxonomies.filter( ( taxonomy ) => {
				return postType.taxonomies.includes( taxonomy.slug );
			} );
		} else {
			taxonomies = [];
		}

		let taxQuery = {};
		for ( let taxonomy of postType.taxonomies ) {
			taxQuery[taxonomy] = attributes[taxonomy]
		}
		const latestPostsQuery = pickBy( {
			...taxQuery,
			order,
			orderby: orderBy,
			per_page: postsToShow,
		}, ( value ) => ! isUndefined( value ) );
		return {
			latestPosts: getEntityRecords( 'postType', postType.slug, latestPostsQuery ),
			taxonomies
		};
	} )( class Posts extends Component {
		constructor() {
			super( ...arguments );
			this.state = {
				isTaxonomiesLoaded: false,
			};
			this.toggleDisplayPostDate = this.toggleDisplayPostDate.bind( this );
		}

		async componentDidMount() {
			this.isStillMounted = true;
		}

		async componentDidUpdate() {
			const { taxonomies } = this.props;
			const { isTaxonomiesLoaded } = this.state;
			if ( ! isTaxonomiesLoaded && taxonomies && taxonomies.length > 0 ) {
				this.setState( { isTaxonomiesLoaded: true } );
				for ( let taxonomy of taxonomies ) {
					let restBase = taxonomy.rest_base;
					try {
						let terms = await apiFetch( { path: addQueryArgs( `/wp/v2/${ restBase }`, TERM_LIST_QUERY ) } );
						if ( this.isStillMounted ) {
							this.setState( { [ taxonomy.slug ]: terms } );
						}
					} catch ( e ) {
						if ( this.isStillMounted ) {
							this.setState( { [ taxonomy.slug ]: [] } );
						}
					}
				}
			}
		}

		componentWillUnmount() {
			this.isStillMounted = false;
		}

		toggleDisplayPostDate() {
			const { displayPostDate } = this.props.attributes;
			const { setAttributes } = this.props;

			setAttributes( { displayPostDate: ! displayPostDate } );
		}

		render() {
			const { className, attributes, setAttributes, latestPosts, taxonomies } = this.props;
			const { termList } = this.state;
			const { order, orderBy, term, postsToShow } = attributes;
			const TermControls = taxonomies.map( ( taxonomy ) => (
				<TermsControls
					taxonomy={ taxonomy }
					termList={ this.state[ taxonomy.slug ] }
					selectedTermId={ term }
					onTermChange={ ( value ) => setAttributes( { [ taxonomy.slug ]: '' !== value ? value : undefined } ) }
				/>
			) );

			const inspectorControls = (
				<InspectorControls>
					<PanelBody title={ __( 'Posts Settings' ) }>
						<QueryControls
							{ ...{ order, orderBy } }
							numberOfItems={ postsToShow }
							onOrderChange={ ( value ) => setAttributes( { order: value } ) }
							onOrderByChange={ ( value ) => setAttributes( { orderBy: value } ) }
							onNumberOfItemsChange={ ( value ) => setAttributes( { postsToShow: value } ) }
						/>
						{ TermControls }
					</PanelBody>
				</InspectorControls>
			);

			// const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;
			// if ( ! hasPosts ) {
			// 	return (
			// 		<Fragment>
			// 			{ inspectorControls }
			// 			<Placeholder
			// 				icon="admin-post"
			// 				label={ __( 'Posts' ) }
			// 			>
			// 				{ ! Array.isArray( latestPosts ) ?
			// 					<Spinner /> :
			// 					__( 'No posts found.' )
			// 				}
			// 			</Placeholder>
			// 		</Fragment>
			// 	);
			// }

			return (
				<Fragment>
					{ inspectorControls }
					<ServerSideRender
						className={ className }
						block={ blockName }
						attributes={ attributes }
					/>
				</Fragment>
			);
		}
	} );
};

export default getEditComponent;