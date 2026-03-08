import { Category } from 'state/Podcast/types';
import { CategorySelect, DirectorySubheader } from './primitives';
import { Component } from 'react';
import { get } from 'lodash-es';
import { getPodcastCategoryUrl } from 'state/Podcast/helpers';
import { IGetTranslateFunctionResponse, localize } from 'redux-i18n';
import { navigate } from 'state/Routing/actions';

type Props = {
  categories: Array<Category>;
  title: string;
  translate: IGetTranslateFunctionResponse;
  value: unknown;
};

class PodcastSelect extends Component<Props> {
  onFilterChange = (url?: string) => {
    if (!url) return;
    navigate({ path: url });
  };

  generateCategories() {
    const { categories, translate } = this.props;
    return categories.reduce(
      (array, category) =>
        category?.name ?
          [
            ...array,
            {
              title: get(category, 'name'),
              value: getPodcastCategoryUrl(
                get(category, 'name'),
                get(category, 'id') as number,
              ),
            },
          ]
        : array,
      [
        {
          title: translate('All Topics'),
          value: '/podcast/',
        },
      ] as Array<{ title: string; value: string | null }>,
    );
  }

  render() {
    const { title, value, translate } = this.props;
    return (
      <div
        css={{ overflow: 'auto' /* prevents collapse with floated children */ }}
      >
        <DirectorySubheader>
          {translate('Stream the best podcasts from your favorite stations')}
        </DirectorySubheader>
        <CategorySelect
          dataTest="podcast-selector"
          name="category"
          onChange={this.onFilterChange}
          options={this.generateCategories()}
          selectClasses="short"
          selectedOption={{
            title,
            value: getPodcastCategoryUrl(title, Number(value)),
          }}
          tabIndex={-1}
        />
      </div>
    );
  }
}

export default localize<Props>('translate')(PodcastSelect);
