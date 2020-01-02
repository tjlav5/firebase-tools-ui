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
import { NodeContainer } from './NodeContainer';
import { useState, useCallback } from 'react';
import { Typography } from '@rmwc/typography';
import { Button } from '@rmwc/button';
import {
  QueryParams,
  DEFAULT_PAGE_SIZE,
  ChildrenDisplayType,
} from './common/view_model';
import { NodeTabularDisplay } from './NodeTabularDisplay';
import { NodeActions } from './NodeActions';

import './NodeParent.scss';

export interface Props {
  realtimeRef: firebase.database.Reference;
  children: string[];
  isRealtime?: boolean;
  queryParams?: QueryParams;
  updateQuery?: (params: QueryParams) => void;
}

export const NodeParent = React.memo<Props>(function NodeParent$({
  realtimeRef,
  children,
  queryParams,
  updateQuery,
}) {
  const isRoot = realtimeRef.parent === null;
  const key = realtimeRef.key || realtimeRef.toString();
  const hasChildren = !!children.length;
  const [isExpanded, setIsExpanded] = useState(isRoot ? true : false);
  const [displayType, setDisplayType] = useState(ChildrenDisplayType.TreeView);

  const hasMore =
    queryParams && queryParams.limit
      ? children.length >= queryParams.limit
      : children.length >= DEFAULT_PAGE_SIZE;

  const loadMore = () => {
    const currentPageSize = queryParams
      ? queryParams.limit || DEFAULT_PAGE_SIZE
      : DEFAULT_PAGE_SIZE;
    updateQuery &&
      updateQuery({
        ...queryParams,
        limit: currentPageSize + DEFAULT_PAGE_SIZE,
      });
  };

  const toggleExpansion = useCallback(() => setIsExpanded(!isExpanded), [
    setIsExpanded,
    isExpanded,
  ]);

  return (
    <div className="NodeParent">
      {/* Label */}
      <div className="NodeParent__label">
        {isExpanded ? (
          <button
            className="NodeParent__tree-button material-icons"
            aria-label="less"
            onClick={toggleExpansion}
          >
            arrow_drop_down
          </button>
        ) : (
          <button
            className="NodeParent__tree-button material-icons"
            aria-label="more"
            onClick={toggleExpansion}
          >
            arrow_right
          </button>
        )}
        <Typography
          className="NodeParent__key"
          use="body1"
          aria-label="Key name"
          onClick={toggleExpansion}
        >
          {key}
        </Typography>
        <NodeActions
          realtimeRef={realtimeRef}
          displayType={displayType}
          onDisplayTypeChange={type => {
            setDisplayType(type);
            setIsExpanded(true);
          }}
          onExpandRequested={() => setIsExpanded(true)}
          queryParams={queryParams}
          updateQuery={updateQuery}
        />
      </div>
      <div className="NodeParent__children-container">
        {hasChildren &&
          isExpanded &&
          (displayType === ChildrenDisplayType.Table ? (
            <NodeTabularDisplay
              realtimeRef={realtimeRef}
              limit={children.length}
              hasMoreRows={hasMore}
              onLoadMore={loadMore}
            />
          ) : (
            <ul className="NodeParent__children">
              {children.map(key => (
                <li key={key}>
                  <NodeContainer realtimeRef={realtimeRef.child(key)} />
                </li>
              ))}
              {hasMore && (
                <li className="load-more">
                  <Button onClick={loadMore}>Load more...</Button>
                </li>
              )}
            </ul>
          ))}
      </div>
    </div>
  );
});