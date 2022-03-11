/* eslint-disable react/destructuring-assignment */
import { Menu, Button, Container } from 'semantic-ui-react';
import { Link, browserHistory } from 'react-router';
import { useQuery } from '@apollo/react-hooks';
import ReactTable from 'react-table-v6';
import React from 'react';

import { GET_ROLES_DATA } from '../utils/queries';
import PageMenu from '../utils/PageMenu';
import { can } from '../../../lib/scopes';

const columns = [
    {
        id: 'name',
        accessor: 'name',
        Header: 'Nome',
        // eslint-disable-next-line react/prop-types
        Cell: props => <Link to={`/admin/role/${props.value}`} data-cy='role-link'>{props.value}</Link>,
    },
    { id: 'description', accessor: 'description', Header: 'Descrição' },
];
const RolesList = () => {
    const { loading, data } = useQuery(GET_ROLES_DATA, { fetchPolicy: 'cache-and-network' });
    return (
        <div>
            <PageMenu icon='sitemap' title='Papéis'>
                {can('roles:w', { anyScope: true }) && (
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button
                                primary
                                data-cy='create-role'
                                icon='add'
                                content='Criar papel'
                                onClick={() => {
                                    browserHistory.push('/admin/role/');
                                }}
                            />
                        </Menu.Item>
                    </Menu.Menu>
                )}
            </PageMenu>
            <Container>
                {!loading && <ReactTable data={data.getRolesData} columns={columns} />}
            </Container>
        </div>
    );
};

export default RolesList;
