<script lang="ts">
import { TableColumn, TableDurationColumn, TableRow, TableSimpleColumn } from '@podman-desktop/ui-svelte';
import moment from 'moment';
import NameColumn from '/@/component/objects/columns/Name.svelte';
import StatusColumn from '/@/component/objects/columns/Status.svelte';
import TypeColumn from '/@/component/services/columns/Type.svelte';
import KubernetesObjectsList from '/@/component/objects/KubernetesObjectsList.svelte';
import { getContext, onMount } from 'svelte';
import { DependencyAccessor } from '/@/inject/dependency-accessor';
import KubernetesEmptyScreen from '/@/component/objects/KubernetesEmptyScreen.svelte';
import ActionsColumn from '/@/component/services/columns/Actions.svelte';
import type { ServiceUI } from './ServiceUI';
import ServiceIcon from '/@/component/icons/ServiceIcon.svelte';
import { ServiceHelper } from './service-helper';
import { States } from '/@/state/states';
import type { EndpointSliceUI } from '/@/component/endpointslices/EndpointSliceUI';
import type { ContextResourceItems } from '@kubernetes-dashboard/channels';
import { EndpointSliceHelper } from '/@/component/endpointslices/endpointslice-helper';
import type { V1EndpointSlice } from '@kubernetes/client-node';

const dependencyAccessor = getContext<DependencyAccessor>(DependencyAccessor);
const serviceHelper = dependencyAccessor.get<ServiceHelper>(ServiceHelper);
const endpointSliceHelper = dependencyAccessor.get<EndpointSliceHelper>(EndpointSliceHelper);

const states = getContext<States>(States);
const updateResource = states.stateUpdateResourceInfoUI;

onMount(() => {
  return updateResource.subscribe({
    contextName: undefined, // ask for resources in the default context
    resourceName: 'endpointslices',
  });
});

let statusColumn = new TableColumn<ServiceUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: StatusColumn,
  comparator: (a, b): number => a.status.localeCompare(b.status),
});

let nameColumn = new TableColumn<ServiceUI>('Name', {
  width: '1.3fr',
  renderer: NameColumn,
  // TODO this comparator results in an infinite loop. Why?
  //  comparator: (a, b): number => a.name.localeCompare(b.name),
});

let typeColumn = new TableColumn<ServiceUI>('Type', {
  renderer: TypeColumn,
  overflow: true,
  comparator: (a, b): number => a.type.localeCompare(b.type),
});

let clusterIPColumn = new TableColumn<ServiceUI | EndpointSliceUI, string>('Cluster IP', {
  renderMapping: (service): string =>
    isServiceUI(service) ? service.clusterIP : `${service.endpoints.length} endpoints`,
  renderer: TableSimpleColumn,
  comparator: (a, b): number => (isServiceUI(a) && isServiceUI(b) ? a.clusterIP.localeCompare(b.clusterIP) : 0),
});

let portsColumn = new TableColumn<ServiceUI, string>('Ports', {
  width: '2fr',
  renderMapping: (service): string => service.ports,
  renderer: TableSimpleColumn,
  comparator: (a, b): number => a.ports.localeCompare(b.ports),
});

let ageColumn = new TableColumn<ServiceUI, Date | undefined>('Age', {
  renderMapping: (service): Date | undefined => service.created,
  renderer: TableDurationColumn,
  comparator: (a, b): number => moment(b.created).diff(moment(a.created)),
});

const columns = [
  statusColumn,
  nameColumn,
  typeColumn,
  clusterIPColumn,
  portsColumn,
  ageColumn,
  new TableColumn<ServiceUI>('Actions', { align: 'right', renderer: ActionsColumn }),
];

const row = new TableRow<ServiceUI | EndpointSliceUI>({
  selectable: (_service): boolean => true,
  children: (service): EndpointSliceUI[] => {
    if (service.kind !== 'Service') {
      return [];
    }
    return (
      updateResource.data?.resources
        .filter((resource: ContextResourceItems) => resource.resourceName === 'endpointslices')
        .flatMap(resource =>
          resource.items
            .filter(item => item.metadata?.ownerReferences?.some(owner => owner.uid === service.uid))
            .map(item => endpointSliceHelper.getEndpointSliceUI(item as V1EndpointSlice)),
        ) ?? []
    );
  },
});

function isServiceUI(service: ServiceUI | EndpointSliceUI): service is ServiceUI {
  return service.kind === 'Service';
}
</script>

<KubernetesObjectsList
  kinds={[
    {
      resource: 'services',
      transformer: serviceHelper.getServiceUI,
    },
  ]}
  singular="service"
  plural="services"
  isNamespaced={true}
  icon={ServiceIcon}
  columns={columns}
  row={row}>
  <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
  {#snippet emptySnippet()}
    <KubernetesEmptyScreen icon={ServiceIcon} resources={['services']} />
  {/snippet}
</KubernetesObjectsList>
