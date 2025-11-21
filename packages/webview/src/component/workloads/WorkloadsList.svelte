<script lang="ts">
import { TableColumn, TableDurationColumn, TableRow } from '@podman-desktop/ui-svelte';
import moment from 'moment';
import NameColumn from '/@/component/objects/columns/Name.svelte';
import StatusColumn from '/@/component/objects/columns/Status.svelte';
import KubernetesObjectsList from '/@/component/objects/KubernetesObjectsList.svelte';
import { getContext, onDestroy, onMount } from 'svelte';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import KubernetesEmptyScreen from '/@/component/objects/KubernetesEmptyScreen.svelte';
import type { DeploymentUI } from '/@/component/deployments/DeploymentUI';
import { DeploymentHelper } from '/@/component/deployments/deployment-helper';
import ConditionsColumn from '/@/component/deployments/columns/Conditions.svelte';
import PodsColumn from '/@/component/deployments/columns/Pods.svelte';
import ActionsColumn from '/@/component/deployments/columns/Actions.svelte';
import { ReplicaSetHelper } from '/@/component/replicasets/replicaset-helper';
import type { ReplicaSetUI } from '/@/component/replicasets/ReplicasetUI';
import { States } from '/@/state/states';
import type { CronJobUI } from '/@/component/cronjobs/CronJobUI';
import type { JobUI } from '/@/component/jobs/JobUI';
import type { PodUI } from '/@/component/pods/PodUI';
import { CronJobHelper } from '/@/component/cronjobs/cronjob-helper';
import { JobHelper } from '/@/component/jobs/job-helper';
import { PodHelper } from '/@/component/pods/pod-helper';
import type { Unsubscriber } from 'svelte/store';
import KubernetesIcon from '/@/component/icons/KubernetesIcon.svelte';

const dependencyAccessor = getContext<DependencyAccessor>(DependencyAccessor);
const deploymenttHelper = dependencyAccessor.get<DeploymentHelper>(DeploymentHelper);
const replicaSetHelper = dependencyAccessor.get<ReplicaSetHelper>(ReplicaSetHelper);
const cronjobHelper = dependencyAccessor.get<CronJobHelper>(CronJobHelper);
const jobHelper = dependencyAccessor.get<JobHelper>(JobHelper);
const podHelper = dependencyAccessor.get<PodHelper>(PodHelper);

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

function getChildren(
  workload: DeploymentUI | ReplicaSetUI | CronJobUI | JobUI | PodUI,
): (ReplicaSetUI | CronJobUI | JobUI | PodUI)[] {
  const children =
    updateResource.data?.resources.flatMap(resource =>
      resource.items
        .filter(item =>
          item.metadata?.ownerReferences?.some(owner => owner.kind === workload.kind && owner.name === workload.name),
        )
        .flatMap(item => {
          let child: ReplicaSetUI | CronJobUI | JobUI | PodUI;
          if (item.kind === 'ReplicaSet') {
            child = replicaSetHelper.getReplicaSetUI(item);
          } else if (item.kind === 'CronJob') {
            child = cronjobHelper.getCronJobUI(item);
          } else if (item.kind === 'Job') {
            child = jobHelper.getJobUI(item);
          } else if (item.kind === 'Pod') {
            child = podHelper.getPodUI(item);
          } else {
            console.error('should not happen', workload.kind);
            throw new Error('should not happen');
          }
          return [child, ...getChildren(child)];
        }),
    ) ?? [];
  return children;
}

const row = new TableRow<DeploymentUI | ReplicaSetUI | CronJobUI | JobUI | PodUI>({
  selectable: (_workload): boolean => true,
  children: getChildren,
});

let unsubscribers: Unsubscriber[] = [];

onMount(() => {
  for (const resource of ['deployments', 'replicasets', 'cronjobs', 'jobs', 'pods']) {
    unsubscribers.push(
      updateResource.subscribe({
        contextName: undefined, // ask for resources in the default context
        resourceName: resource,
      }),
    );
  }
});

onDestroy(() => {
  unsubscribers.forEach(unsubscriber => unsubscriber());
  unsubscribers = [];
});
</script>

<KubernetesObjectsList
  kinds={[
    {
      resource: 'deployments',
      transformer: deploymenttHelper.getDeploymentUI.bind(deploymenttHelper),
    },
    {
      resource: 'cronjobs',
      transformer: cronjobHelper.getCronJobUI.bind(cronjobHelper),
    },
    {
      resource: 'jobs',
      transformer: jobHelper.getJobUI.bind(jobHelper),
    },
    {
      resource: 'pods',
      transformer: podHelper.getPodUI.bind(podHelper),
    },
  ]}
  singular="workload"
  plural="workloads"
  isNamespaced={true}
  icon={KubernetesIcon}
  columns={columns}
  row={row}
  orphansOnly={true}>
  <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
  {#snippet emptySnippet()}
    <KubernetesEmptyScreen icon={KubernetesIcon} resources={['deployments', 'cronjobs', 'jobs']} />
  {/snippet}
</KubernetesObjectsList>
