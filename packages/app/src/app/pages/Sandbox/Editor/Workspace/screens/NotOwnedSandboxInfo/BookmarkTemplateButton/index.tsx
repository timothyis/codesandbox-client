import {
  MutationHookOptions,
  useLazyQuery,
  useMutation,
} from '@apollo/react-hooks';
import { Button, Icon, Menu, Stack } from '@codesandbox/components';
import {
  BookmarkTemplateMutation,
  BookmarkTemplateMutationVariables,
  BookmarkedSandboxInfoQuery,
  BookmarkedSandboxInfoQueryVariables,
  UnbookmarkTemplateMutation,
  UnbookmarkTemplateMutationVariables,
} from 'app/graphql/types';
import { useOvermind } from 'app/overmind';
import React, { useEffect } from 'react';

import { BOOKMARK_TEMPLATE, UNBOOKMARK_TEMPLATE } from './mutations';
import { BOOKMARKED_SANDBOX_INFO } from './queries';

export const BookmarkTemplateButton = () => {
  const {
    state: {
      isLoggedIn,
      editor: { sandbox },
    },
  } = useOvermind();

  const [runQuery, { loading, data }] = useLazyQuery<
    BookmarkedSandboxInfoQuery,
    BookmarkedSandboxInfoQueryVariables
  >(BOOKMARKED_SANDBOX_INFO);

  useEffect(() => {
    if (isLoggedIn) {
      runQuery({
        variables: { sandboxId: sandbox.id },
      });
    }
  }, [isLoggedIn, runQuery, sandbox.id]);

  const bookmarkInfos = data?.sandbox?.customTemplate?.bookmarked || [];

  const config = (
    entityIndex: number = 0
  ): MutationHookOptions<
    BookmarkTemplateMutation | UnbookmarkTemplateMutation,
    BookmarkTemplateMutationVariables | UnbookmarkTemplateMutationVariables
  > => {
    const bookmarkInfo = bookmarkInfos[entityIndex];

    if (!bookmarkInfo) {
      return {};
    }

    return {
      variables: {
        template: data?.sandbox?.customTemplate?.id,
        team:
          bookmarkInfo.entity.__typename === 'Team'
            ? bookmarkInfo.entity.id
            : undefined,
      },
      optimisticResponse: {
        __typename: 'RootMutationType',
        template: {
          __typename: 'Template',
          id: sandbox.customTemplate.id,
          bookmarked: bookmarkInfos.map(b => {
            if (b.entity.id !== bookmarkInfo.entity.id) {
              return b;
            }

            return {
              ...b,
              isBookmarked: !b.isBookmarked,
            };
          }),
        },
      },
    };
  };

  const [bookmark] = useMutation<
    BookmarkTemplateMutation,
    BookmarkTemplateMutationVariables
  >(BOOKMARK_TEMPLATE, config());
  const [unbookmark] = useMutation<
    UnbookmarkTemplateMutation,
    UnbookmarkTemplateMutationVariables
  >(UNBOOKMARK_TEMPLATE, config());

  const handleToggleFollow = (i: number = 0) =>
    bookmarkInfos[i].isBookmarked ? unbookmark(config(i)) : bookmark(config(i));

  return (
    <Stack>
      <Button
        disabled={loading}
        onClick={() => handleToggleFollow(0)}
        css={{
          width: 'calc(100% - 26px)',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        {bookmarkInfos[0]?.isBookmarked
          ? `Remove Bookmark`
          : `Bookmark Template`}
      </Button>
      <Menu>
        <Menu.Button
          variant="primary"
          css={{
            width: '26px',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          <Icon size={8} name="caret" />
        </Menu.Button>
        <Menu.List>
          {bookmarkInfos.map(({ entity: { name } }, index: number) => (
            <Menu.Item key={name} onSelect={() => handleToggleFollow(index)}>
              {bookmarkInfos[index].isBookmarked ? 'Remove from ' : 'Add to '}
              {index === 0 ? 'My Bookmarks' : name}
            </Menu.Item>
          ))}
        </Menu.List>
      </Menu>
    </Stack>
  );
};
