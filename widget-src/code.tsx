const { widget } = figma;
const {
  useSyncedState,
  AutoLayout,
  Text,
  Image,
  Frame,
  useSyncedMap,
  usePropertyMenu,
} = widget;

function Button({
  text,
  textSize = 12,
  onClick,
}: {
  text: string;
  textSize?: number;
  onClick: () => void;
}) {
  return (
    <AutoLayout
      stroke="#2a2a2a"
      strokeWidth={1}
      cornerRadius={100}
      padding={10}
      spacing={10}
      onClick={onClick}
    >
      <Text fill="#2a2a2a" fontSize={textSize}>
        {text}
      </Text>
    </AutoLayout>
  );
}

function TeammatePhotoBubble({
  figmaUser,
  isActive = false,
  hasGone = false,
}: {
  figmaUser: User;
  isActive?: boolean;
  hasGone?: boolean;
}) {
  const { photoUrl, name } = figmaUser;
  const diameter = isActive ? 50 : 30;
  const textWidth = isActive ? undefined : 80;
  const fontSize = isActive ? 16 : 12;

  return (
    <AutoLayout
      direction="horizontal"
      horizontalAlignItems="start"
      verticalAlignItems="center"
      spacing={12}
      width="fill-parent"
      opacity={hasGone ? 0.5 : 1}
    >
      <AutoLayout stroke="#2a2a2a" cornerRadius={100}>
        {photoUrl ? (
          <Image
            cornerRadius={6}
            width={diameter}
            height={diameter}
            src={photoUrl}
          />
        ) : (
          <Frame
            cornerRadius={6}
            width={diameter}
            height={diameter}
            fill="#2A2A2A"
          />
        )}
      </AutoLayout>
      {/* TODO: handle really long names / text resizing */}
      <AutoLayout width="fill-parent">
        <Text fontSize={fontSize} width="fill-parent">
          {isActive ? `${name}, it's your turn!` : name}
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}

function isUserInMap(userMap: SyncedMap<User>, user: User): boolean {
  for (const existingUser of userMap.values()) {
    if (existingUser.id === user.id) {
      return true;
    }
  }
  return false;
}

function parseAndSortKeys(map: SyncedMap<any>) {
  const parsedKeys = Array.from(map.keys(), parseFloat).filter(
    (key) => !isNaN(key)
  );
  parsedKeys.sort((a, b) => a - b);
  return parsedKeys.map((key) => key.toString());
}

function TeammatePhotoBubbleRow({
  user1 = undefined,
  user2 = undefined,
  user3 = undefined,
  hasGone = false,
}: {
  key?: any;
  user1?: User | undefined;
  user2?: User | undefined;
  user3?: User | undefined;
  hasGone?: boolean;
}) {
  return (
    <AutoLayout
      direction={"horizontal"}
      // verticalAlignItems="center"
      // horizontalAlignItems="center"
      spacing={30}
      padding={{ bottom: 10, top: 10 }}
      width={"fill-parent"}
    >
      {user1 ? (
        <TeammatePhotoBubble figmaUser={user1} hasGone={hasGone} />
      ) : (
        <AutoLayout width="fill-parent" height={1} />
      )}
      {user2 ? (
        <TeammatePhotoBubble figmaUser={user2} hasGone={hasGone} />
      ) : (
        <AutoLayout width="fill-parent" height={1} />
      )}
      {user3 ? (
        <TeammatePhotoBubble figmaUser={user3} hasGone={hasGone} />
      ) : (
        <AutoLayout width="fill-parent" height={1} />
      )}
    </AutoLayout>
  );
}

function Widget() {
  const displayOrder = useSyncedMap<User>("displayOrder");
  const goneOrder = useSyncedMap<User>("goneOrder");
  const userIdToUser = useSyncedMap("idToUser");
  const [showGoneOrder, setShowGoneOrder] = useSyncedState<boolean>(
    "showGoneOrder",
    false
  );

  const debugMode = false;

  const resetDisplayOrder = () => {
    displayOrder.keys().forEach((k) => displayOrder.delete(k));
  };

  const addUserToDisplay = () => {
    const currentUser = figma.currentUser;
    if (!currentUser) {
      return;
    }

    // if not in debug mode, only allow adding yourself to the queue once
    if (!debugMode && isUserInMap(displayOrder, currentUser)) {
      return;
    }

    const largestKey = Math.max(...displayOrder.keys().map(parseFloat), 0);
    const nextKey = largestKey + 1;

    displayOrder.set(nextKey.toString(), currentUser);
  };

  const removeUserFromDisplay = () => {
    const smallestKey = Math.min(...displayOrder.keys().map(parseFloat));

    const userToRemove = displayOrder.get(smallestKey.toString());
    if (!userToRemove) {
      return;
    }
    goneOrder.set(smallestKey.toString(), userToRemove);

    displayOrder.delete(smallestKey.toString());
  };

  const renderTeammatePhotoBubbles = (syncedMap: SyncedMap<User>) => {
    const sortedKeys = parseAndSortKeys(syncedMap);

    // skip the first user because we'll render them separately
    let isFirstUser = true;

    return sortedKeys.map((key) => {
      const user = displayOrder.get(key);

      if (user) {
        if (isFirstUser) {
          isFirstUser = false; // Mark the first user as visited
          return null; // Skip the first user
        }

        return <TeammatePhotoBubble key={key} figmaUser={user} />;
      }

      return null;
    });
  };

  const getFirstUserKey = (syncedMap: SyncedMap<User>) => {
    const smallestKey = Math.min(...displayOrder.keys().map(parseFloat));
    return smallestKey.toString();
  };

  const getRemainingUsers = (
    syncedMap: SyncedMap<User>,
    usersToSkip: number
  ) => {
    const smallestKey = Math.min(...syncedMap.keys().map(parseFloat));

    let userArray: Array<User> = [];

    // Iterate through the Map starting from the second element
    let isFirstElement = true;
    let skipped = 0;
    for (const [key, user] of syncedMap.entries()) {
      if (skipped === usersToSkip) {
        userArray.push(user);
      } else {
        skipped = skipped + 1;
      }
    }

    return userArray;
  };

  usePropertyMenu(
    [
      displayOrder.size !== 0 && {
        tooltip: "Clear participant list",
        propertyName: "clear",
        itemType: "action",
      },
      (displayOrder.size !== 0 || goneOrder.size > 0) &&
        !showGoneOrder && {
          tooltip: "Show previous participants",
          propertyName: "show-prev-users",
          itemType: "action",
        },
      (displayOrder.size !== 0 || goneOrder.size > 0) &&
        showGoneOrder && {
          tooltip: "Hide previous participants",
          propertyName: "hide-prev-users",
          itemType: "action",
        },
    ].filter(Boolean) as WidgetPropertyMenuItem[],
    (e) => {
      if (e.propertyName === "clear") {
        resetDisplayOrder();
      } else if (e.propertyName === "show-prev-users") {
        setShowGoneOrder(true);
      } else if (e.propertyName === "hide-prev-users") {
        setShowGoneOrder(false);
      } else {
        // resetAll();
      }
    }
  );

  return (
    <AutoLayout
      direction="vertical"
      fill="#FFFFFF"
      stroke="#E6E6E6"
      width={500}
      minHeight={220}
      spacing={20}
      cornerRadius={10}
      padding={{ top: 40, left: 40, right: 40, bottom: 40 }}
    >
      {/* Empty state */}
      {displayOrder.size < 1 && (
        <AutoLayout height={85} verticalAlignItems="center">
          <Text>{`Click the button to add yourself to the list.`}</Text>
        </AutoLayout>
      )}
      {/* There's someone whose turn it is */}
      {displayOrder.size > 0 && (
        <AutoLayout
          direction="horizontal"
          spacing={20}
          horizontalAlignItems="center"
          verticalAlignItems="center"
          width={"fill-parent"}
        >
          <TeammatePhotoBubble
            key={getFirstUserKey(displayOrder)}
            figmaUser={displayOrder.get(getFirstUserKey(displayOrder))!}
            isActive={true}
          />
          {displayOrder.size > 0 ? (
            <Button text="Next" onClick={removeUserFromDisplay} />
          ) : (
            <></>
          )}
        </AutoLayout>
      )}
      {displayOrder.size === 1 && (
        <AutoLayout direction="vertical">
          <Text
            fontSize={12}
          >{`Click the button to add yourself to the list.`}</Text>
        </AutoLayout>
      )}
      {/* People waiting in line */}
      {displayOrder.size > 1 && (
        <AutoLayout spacing={8} width={"fill-parent"} direction="vertical">
          <AutoLayout direction="vertical" spacing={20}>
            <Text>{`Who's up next?`}</Text>
          </AutoLayout>

          <AutoLayout direction={"vertical"} width={"fill-parent"}>
            {getRemainingUsers(displayOrder, 1).map((user, idx, users) => {
              if (idx % 3 != 0) {
                return null;
              }
              return (
                <TeammatePhotoBubbleRow
                  key={idx}
                  user1={users[idx]}
                  user2={users[idx + 1]}
                  user3={users[idx + 2]}
                />
              );
            })}
          </AutoLayout>
        </AutoLayout>
      )}

      {/* Button to join list */}
      <AutoLayout>
        <Button text="Join the list" onClick={addUserToDisplay} />
      </AutoLayout>

      {/* Users who have gone */}
      {showGoneOrder && goneOrder.size > 0 && (
        <AutoLayout spacing={8} width={"fill-parent"} direction="vertical">
          <AutoLayout direction="vertical" spacing={20}>
            <Text fontSize={12}>{`Who's already gone?`}</Text>
          </AutoLayout>

          <AutoLayout direction={"vertical"} width={"fill-parent"}>
            {getRemainingUsers(goneOrder, 0).map((user, idx, users) => {
              if (idx % 3 != 0) {
                return null;
              }
              return (
                <TeammatePhotoBubbleRow
                  key={idx}
                  user1={users[idx]}
                  user2={users[idx + 1]}
                  user3={users[idx + 2]}
                  hasGone={true}
                />
              );
            })}
          </AutoLayout>
        </AutoLayout>
      )}
    </AutoLayout>
  );
}

widget.register(Widget);
