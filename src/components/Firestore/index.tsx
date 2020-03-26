/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import './index.scss';

import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { Elevation } from '@rmwc/elevation';
import { GridCell } from '@rmwc/grid';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { AppState } from '../../store';
import { FirestoreConfig } from '../../store/config';
import { CustomThemeProvider } from '../../themes';
import { InteractiveBreadCrumbBar } from '../common/InteractiveBreadCrumbBar';
import DatabaseApi from './api';
import { ApiProvider } from './ApiContext';
import { promptClearAll } from './dialogs/clearAll';
import { Root } from './Document';

export interface PropsFromState {
  config?: FirestoreConfig;
  projectId?: string;
}

export type Props = PropsFromState;

export const Firestore: React.FC<Props> = ({ config, projectId }) => {
  const [api, setApi] = useState<DatabaseApi | undefined>(undefined);
  const databaseId = '(default)';
  const location = useLocation();
  const history = useHistory();

  // TODO: do something better here!
  const path = location.pathname.replace(/^\/firestore\/data/, '');

  useEffect(() => {
    if (!config || !projectId) return;

    const api = new DatabaseApi(projectId, databaseId, config);
    setApi(api);

    return function cleanup() {
      api.delete();
    };
  }, [projectId, config, setApi]);

  if (!api) {
    return <p>Connecting to Firestore...</p>;
  }

  async function handleClearData(api: DatabaseApi) {
    const shouldNuke = await promptClearAll();
    if (!shouldNuke) return;
    api.nukeDocuments();
  }

  function handleNavigate(path: string) {
    history.push(`/firestore/data/${path}`);
  }

  return (
    <ApiProvider value={api}>
      <GridCell span={12} className="Firestore">
        <div className="Firestore-actions">
          <CustomThemeProvider use="warning" wrap>
            <Button unelevated onClick={() => handleClearData(api)}>
              Clear all data
            </Button>
          </CustomThemeProvider>
        </div>
        <Elevation z="2" wrap>
          <Card className="Firestore-panels-wrapper">
            <InteractiveBreadCrumbBar
              base="/firestore/data"
              path={path}
              onNavigate={handleNavigate}
            />
            <div className="Firestore-panels">
              <Root />
            </div>
          </Card>
        </Elevation>
      </GridCell>
    </ApiProvider>
  );
};

export const mapStateToProps = ({ config }: AppState) => ({
  config: config.config && config.config.firestore,
  projectId: config.config && config.config.projectId,
});

export default connect(mapStateToProps)(Firestore);
