import { storiesOf } from "@storybook/react";
import React from "react";

import CollectionListPage, {
  CollectionListPageProps
} from "../../../collections/components/CollectionListPage";
import { collections } from "../../../collections/fixtures";
import {
  listActionsProps,
  pageListProps,
  searchPageProps,
  tabPageProps
} from "../../../fixtures";
import Decorator from "../../Decorator";

const props: CollectionListPageProps = {
  ...listActionsProps,
  ...pageListProps.default,
  ...searchPageProps,
  ...tabPageProps,
  collections
};

storiesOf("Views / Collections / Collection list", module)
  .addDecorator(Decorator)
  .add("default", () => <CollectionListPage {...props} />)
  .add("loading", () => (
    <CollectionListPage {...props} collections={undefined} disabled={true} />
  ))
  .add("no data", () => <CollectionListPage {...props} collections={[]} />);
