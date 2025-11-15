<script lang="ts">
import { TableColumn, TableDurationColumn, TableRow } from '@podman-desktop/ui-svelte';
import moment from 'moment';
import NameColumn from '/@/component/objects/columns/Name.svelte';
import StatusColumn from '/@/component/objects/columns/Status.svelte';
import KubernetesObjectsList from '/@/component/objects/KubernetesObjectsList.svelte';
import { getContext, onMount } from 'svelte';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import KubernetesEmptyScreen from '/@/component/objects/KubernetesEmptyScreen.svelte';
import type { DeploymentUI } from './DeploymentUI';
import { DeploymentHelper } from './deployment-helper';
import DeploymentIcon from '/@/component/icons/DeploymentIcon.svelte';
import ConditionsColumn from './columns/Conditions.svelte';
import PodsColumn from './columns/Pods.svelte';
import ActionsColumn from './columns/Actions.svelte';
import { ReplicaSetHelper } from '/@/component/replicasets/replicaset-helper';
import type { ReplicaSetUI } from '/@/component/replicasets/ReplicasetUI';
import { States } from '/@/state/states';
import type { ContextResourceItems } from '@kubernetes-dashboard/channels';

const dependencyAccessor = getContext<DependencyAccessor>(DependencyAccessor);
const deploymenttHelper = dependencyAccessor.get<DeploymentHelper>(DeploymentHelper);
const replicaSetHelper = dependencyAccessor.get<ReplicaSetHelper>(ReplicaSetHelper);

let statusColumn = new TableColumn<DeploymentUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: StatusColumn,
  comparator: (a, b): number => a.status.localeCompare(b.status),
});

let nameColumn = new TableColumn<DeploymentUI>('Name', {
  renderer: NameColumn,
  comparator: (a, b): number => a.name.localeCompare(b.name),
});

let conditionsColumn = new TableColumn<DeploymentUI>('Conditions', {
  width: '2fr',
  overflow: true,
  renderer: ConditionsColumn,
});

let podsColumn = new TableColumn<DeploymentUI>('Pods', {
  renderer: PodsColumn,
});

let ageColumn = new TableColumn<DeploymentUI, Date | undefined>('Age', {
  renderMapping: (deployment): Date | undefined => deployment.created,
  renderer: TableDurationColumn,
  comparator: (a, b): number => moment(b.created).diff(moment(a.created)),
});

const columns = [
  statusColumn,
  nameColumn,
  conditionsColumn,
  podsColumn,
  ageColumn,
  new TableColumn<DeploymentUI>('Actions', { align: 'right', renderer: ActionsColumn }),
];

const states = getContext<States>(States);
const updateResource = states.stateUpdateResourceInfoUI;

const row = new TableRow<DeploymentUI | ReplicaSetUI>({
  selectable: (_deployment): boolean => true,
  children: (deployment): ReplicaSetUI[] => {
    return (
      updateResource.data?.resources
        .filter((resource: ContextResourceItems) => resource.resourceName === 'replicasets')
        .flatMap(resource =>
          resource.items
            .filter(item =>
              item.metadata?.ownerReferences?.some(
                owner => owner.kind === 'Deployment' && owner.name === deployment.name,
              ),
            )
            .map(item => replicaSetHelper.getReplicaSetUI(item)),
        ) ?? []
    );
  },
});

onMount(() => {
  return updateResource.subscribe({
    contextName: undefined, // ask for resources in the default context
    resourceName: 'replicasets',
  });
});
</script>

<KubernetesObjectsList
  kinds={[
    {
      resource: 'deployments',
      transformer: deploymenttHelper.getDeploymentUI,
    },
  ]}
  singular="deployment"
  plural="deployments"
  isNamespaced={true}
  icon={DeploymentIcon}
  columns={columns}
  row={row}>
  <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
  {#snippet emptySnippet()}
    <KubernetesEmptyScreen icon={DeploymentIcon} resources={['deployments']} />
  {/snippet}
</KubernetesObjectsList>
