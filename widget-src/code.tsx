const { widget } = figma;
const { useSyncedState, AutoLayout, Text, Image, Frame, useSyncedMap } = widget;

function Button({
  text,
  textSize = 14,
  onClick,
}: {
  text: string;
  textSize?: number;
  onClick: () => void;
}) {
  return (
    <AutoLayout
      stroke="#2a2a2a"
      strokeWidth={2}
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
}: {
  figmaUser: User;
  isActive?: boolean;
}) {
  const { photoUrl, name } = figmaUser;
  const diameter = isActive ? 50 : 30;
  const textWidth = isActive ? undefined : 80;
  const fontSize = isActive ? 20 : 12;

  return (
    <AutoLayout
      direction="horizontal"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      spacing={12}
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
      <Text width={textWidth} horizontalAlignText="left" fontSize={fontSize}>
        {isActive ? `${name}, it's your turn!` : name}
      </Text>
    </AutoLayout>
  );
}

function isUserInMap(userMap: SyncedMap, user: User): boolean {
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

function Widget() {
  const displayOrder = useSyncedMap("displayOrder");
  const userIdToUser = useSyncedMap("idToUser");

  const debugMode = false;

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
    displayOrder.delete(smallestKey.toString());
  };

  const renderTeammatePhotoBubbles = (syncedMap: SyncedMap) => {
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

  const getFirstUserKey = (syncedMap: SyncedMap) => {
    const smallestKey = Math.min(...displayOrder.keys().map(parseFloat));
    return smallestKey.toString();
  };

  return (
    <AutoLayout
      direction="vertical"
      fill="#FFFFFF"
      stroke="#E6E6E6"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      spacing={20}
      cornerRadius={10}
      padding={{ top: 40, left: 20, right: 20, bottom: 40 }}
    >
      {displayOrder.size > 0 && (
        <AutoLayout
          direction="vertical"
          spacing={20}
          horizontalAlignItems="center"
        >
          <TeammatePhotoBubble
            key={getFirstUserKey(displayOrder)}
            figmaUser={displayOrder.get(getFirstUserKey(displayOrder))}
          />
          <Button text="Next" onClick={removeUserFromDisplay} />
        </AutoLayout>
      )}
      {displayOrder.size > 1 && (
        <AutoLayout direction="vertical" spacing={20}>
          {renderTeammatePhotoBubbles(displayOrder)}
        </AutoLayout>
      )}
      <AutoLayout
        direction="vertical"
        spacing={20}
        horizontalAlignItems="center"
      >
        <Button text="Add me to the list" onClick={addUserToDisplay} />
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);
