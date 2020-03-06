import getTemplateDefinition from '@codesandbox/common/lib/templates';
import getIcon from '@codesandbox/common/lib/templates/icons';
import { getSandboxName } from '@codesandbox/common/lib/utils/get-sandbox-name';
import {
  profileUrl,
  sandboxUrl,
} from '@codesandbox/common/lib/utils/url-generator';
import {
  Avatar,
  Collapsible,
  Element,
  Link,
  List,
  ListItem,
  Stack,
  Stats,
  Tags,
  Text,
} from '@codesandbox/components';
import { Icons } from '@codesandbox/template-icons';
import css from '@styled-system/css';
import { useOvermind } from 'app/overmind';
import React from 'react';

import { BookmarkTemplateButton } from './BookmarkTemplateButton';

export const Summary = () => {
  const {
    state: {
      isLoggedIn,
      editor: { sandbox },
    },
  } = useOvermind();
  const {
    author,
    description,
    customTemplate,
    template,
    forkedFromSandbox,
    forkedTemplateSandbox,
    tags,
    team,
  } = sandbox;

  const isForked = forkedFromSandbox || forkedTemplateSandbox;
  const { url: templateUrl } = getTemplateDefinition(template);

  return (
    <>
      <Collapsible
        title={customTemplate ? 'Template Info' : 'Sandbox Info'}
        defaultOpen
      >
        <Element marginBottom={6}>
          <Stack as="section" direction="vertical" gap={2} paddingX={2}>
            <Stack justify="space-between" align="center">
              {customTemplate ? (
                <Stack gap={2} align="center">
                  <TemplateIcon
                    iconUrl={customTemplate.iconUrl}
                    environment={template}
                  />
                  <Text maxWidth={190}>{getSandboxName(sandbox.get())}</Text>
                </Stack>
              ) : (
                <Text maxWidth={190}>{getSandboxName(sandbox.get())}</Text>
              )}
            </Stack>

            <Text variant="muted">{description}</Text>

            {tags.length ? (
              <Element marginTop={4}>
                <Tags tags={tags} />
              </Element>
            ) : null}
          </Stack>
        </Element>

        <Stack as="section" direction="vertical" gap={6} paddingX={2}>
          <Stats sandbox={sandbox.get()} />
          {customTemplate && isLoggedIn && <BookmarkTemplateButton />}
        </Stack>

        <Divider marginTop={8} marginBottom={4} />

        <Stack as="section" direction="vertical" gap={4}>
          {author ? (
            <Link href={profileUrl(author.username)}>
              <Stack gap={2} align="center" paddingX={2}>
                <Avatar user={author} />
                <Stack direction="vertical">
                  <Text variant={team ? 'body' : 'muted'} block>
                    {author.username}
                  </Text>
                  {team && (
                    <Text size={2} variant="muted">
                      {team.name}
                    </Text>
                  )}
                </Stack>
              </Stack>
            </Link>
          ) : null}

          <List>
            {isForked ? (
              <ListItem justify="space-between">
                <Text>
                  {forkedTemplateSandbox ? 'Template' : 'Forked From'}
                </Text>
                <Link
                  variant="muted"
                  href={sandboxUrl(forkedFromSandbox || forkedTemplateSandbox)}
                  target="_blank"
                >
                  {getSandboxName(forkedFromSandbox || forkedTemplateSandbox)}
                </Link>
              </ListItem>
            ) : null}
            <ListItem justify="space-between">
              <Text>Environment</Text>
              <Link variant="muted" href={templateUrl} target="_blank">
                {template}
              </Link>
            </ListItem>
          </List>
        </Stack>
      </Collapsible>
    </>
  );
};

const TemplateIcon = ({ iconUrl, environment }) => {
  const Icon = Icons[iconUrl] || getIcon(environment);
  return <Icon />;
};

const Divider = props => (
  <Element
    as="hr"
    css={css({
      width: '100%',
      border: 'none',
      borderBottom: '1px solid',
      borderColor: 'sideBar.border',
    })}
    {...props}
  />
);
