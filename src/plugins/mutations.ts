import gql from "graphql-tag";

import { TypedMutation } from "../mutations";
import { pluginsDetailsFragment } from "./queries";
import { PluginUpdate, PluginUpdateVariables } from "./types/pluginUpdate";

const pluginUpdate = gql`
  ${pluginsDetailsFragment}
  mutation PluginUpdate($id: ID!, $input: PluginUpdateInput!) {
    pluginUpdate(id: $id, input: $input) {
      errors {
        field
        message
      }
      plugin {
        ...pluginsDetailsFragment
      }
    }
  }
`;
export const TypedPluginUpdate = TypedMutation<
  PluginUpdate,
  PluginUpdateVariables
>(pluginUpdate);
