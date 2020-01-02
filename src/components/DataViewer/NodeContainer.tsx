/**
 * Copyright 2020 Google LLC
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

import * as React from 'react';
import * as firebase from 'firebase/app';
import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { NodeParent } from './NodeParent';
import { NodeLeaf } from './NodeLeaf';
import {
  ViewModel,
  DEFAULT_QUERY_PARAMS,
  QueryParams,
} from './common/view_model';
import { createViewModel, canDoRealtime } from './common/fetch';

export interface Props {
  realtimeRef: firebase.database.Reference;
}

const initialState: ViewModel = {
  isLoading: true,
  children: [],
};

export const NodeContainer = React.memo<Props>(function NodeContainer$({
  realtimeRef,
}) {
  const [viewModel, setViewModel] = useState<ViewModel>(initialState);
  const [querySubject, setQuerySubject] = useState<
    Subject<QueryParams> | undefined
  >(undefined);

  useEffect(() => {
    const canDoRealtime$ = canDoRealtime(realtimeRef);
    const { query, viewModel$ } = createViewModel(realtimeRef, canDoRealtime$);
    setQuerySubject(query);
    const sub = viewModel$.subscribe(vm => setViewModel(vm));
    return () => sub.unsubscribe();
  }, [realtimeRef]);

  const updateQuery = (q: QueryParams) => {
    setQueryParams(q);
    querySubject && querySubject.next(q);
  };

  const [queryParams, setQueryParams] = useState(DEFAULT_QUERY_PARAMS);

  const { children } = viewModel;
  const hasChildren = !!children.length;
  const isFiltered = queryParams !== DEFAULT_QUERY_PARAMS;
  return !hasChildren && !isFiltered ? (
    <NodeLeaf realtimeRef={realtimeRef} value={viewModel.value!} />
  ) : (
    <NodeParent
      realtimeRef={realtimeRef}
      children={children}
      queryParams={queryParams}
      updateQuery={updateQuery}
    />
  );
});