import { TovelundGame, TovelundElementType, TovelundDistanceRule, TovelundSequenceRule, TovelundEntityGroup, TovelundFeature, TovelundRelationshipRule, ITovelundRule, TovelundQuantityRule, TovelundClue, TovelundEntity, TovelundColor } from "./TovelundEnums";

export class TovelundGameClass {
  game: TovelundGame;
  usedIds: string[];

  idCharacters: string = "0123456789ABCDEF";
  alphabet: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  constructor(game?: TovelundGame) {
    const usedIds: string[] = [];

    if (game) {
      game.clues.map((clue: { id: string, rules: { id: string }[] }) => {
        usedIds.push(clue.id);

        clue.rules.map((rule: { id: string }) => {
          usedIds.push(rule.id);
        });
      });

      game.entities.map((entity: { id: string, rectangle?: { id: string }, points: { id: string }[], lines: { id: string, vertices: { id: string }[] }[] }) => {
        usedIds.push(entity.id);

        if (entity.rectangle) {
          usedIds.push(entity.rectangle.id);
        }

        entity.points.map((point: { id: string }) => {
          usedIds.push(point.id);
        });

        entity.lines.map((line: { id: string, vertices: { id: string }[] }) => {
          usedIds.push(line.id);

          line.vertices.map((vertex: { id: string }) => {
            usedIds.push(vertex.id);
          });
        });
      });

      game.featureCollections.map((collection: { id: string, set: { id: string }[] }) => {
        usedIds.push(collection.id);

        collection.set.map((entity: { id: string }) => {
          usedIds.push(entity.id);
        });
      });

      game.entityGroups.map((entityGroup: { id: string }) => {
        usedIds.push(entityGroup.id);
      });

      game.entityGroupTypes.map((groupType: { id: string }) => {
        usedIds.push(groupType.id);
      })
    } else {
      game = {
        scale: 100,
        entities: [],
        entityGroups: [],
        clues: [],
        featureCollections: [],
        entityGroupTypes: []
      };
    }

    this.game = game;
    this.usedIds = usedIds;
  }

  getJSON = () => {
    return JSON.stringify(this.game);
  }

  generateId = () => {
    return `${this.idCharacters[Math.floor(Math.random() * 16)]}${this.idCharacters[Math.floor(Math.random() * 16)]}${this.idCharacters[Math.floor(Math.random() * 16)]}${this.idCharacters[Math.floor(Math.random() * 16)]}`;
  }

  getUniqueId = () => {
    let newId = this.generateId();

    while (this.usedIds.filter(id => id === newId).length > 0) {
      newId = this.generateId();
    }

    this.usedIds.push(newId);

    return newId;
  }

  addEntity = (featureCollectionId: string) => {
    const entityId = this.getUniqueId();

    this.game.entities.push({ id: entityId, name: `Entity ${this.game.entities.length + 1}`, points: [], lines: [], featureCollectionId: featureCollectionId });

    return entityId;
  }

  getEntities = () => {
    return this.game.entities;
  }

  getEntity = (entityId: string) => {
    return this.game.entities.filter(e => e.id === entityId)[0];
  }

  deleteEntity = (entityId: string) => {
    const entity = this.getEntity(entityId);

    const entityIndex = this.game.entities.indexOf(entity);
    this.game.entities.splice(entityIndex, 1);
  }

  changeEntityName = (entityId: string, name: string) => {
    const entity = this.getEntity(entityId);

    entity.name = name;
  }

  setEntityFeatureCollectionId = (entityId: string, featureCollectionId: string) => {
    const entity = this.getEntity(entityId);

    entity.featureCollectionId = featureCollectionId;
    entity.fixedFeatureId = undefined;
  }

  setEntityFixedFeatureId = (entityId: string, featureId?: string) => {
    const entity = this.getEntity(entityId);

    entity.fixedFeatureId = featureId;
  }

  setEntitySelectedFeatureId = (entityId: string, featureId?: string) => {
    const entity = this.getEntity(entityId);

    entity.selectedFeatureId = featureId;
    delete entity.innerPencilFeatureIds;
    delete entity.outerPencilFeatureIds;
  }

  toggleInnerPencilFeatureIds = (entityId: string, featureId: string) => {
    const entity = this.getEntity(entityId);

    if (entity.innerPencilFeatureIds === undefined) {
      entity.innerPencilFeatureIds = [];
    }

    const indexOfFeatureid = entity.innerPencilFeatureIds.indexOf(featureId);

    if (indexOfFeatureid === -1) {
      entity.innerPencilFeatureIds.push(featureId);
    } else {
      entity.innerPencilFeatureIds.splice(indexOfFeatureid, 1);
    }
  }

  toggleOuterPencilFeatureIds = (entityId: string, featureId: string) => {
    const entity = this.getEntity(entityId);

    if (entity.outerPencilFeatureIds === undefined) {
      entity.outerPencilFeatureIds = [];
    }

    const indexOfFeatureid = entity.outerPencilFeatureIds.indexOf(featureId);

    if (indexOfFeatureid === -1) {
      entity.outerPencilFeatureIds.push(featureId);
    } else {
      entity.outerPencilFeatureIds.splice(indexOfFeatureid, 1);
    }
  }

  addRectangle = (entityId: string) => {
    const entity = this.getEntity(entityId);

    if (entity.rectangle === undefined) {
      const rectangleId = this.getUniqueId();

      entity.rectangle = { id: rectangleId, attributes: { "Orientation": "HORIZONTAL" }, x: 0, y: 0 };

      return rectangleId;
    } else {
      return entity.rectangle.id;
    }
  }

  getRectangle = (rectangleId: string) => {
    const entity = this.game.entities.filter(e => e.rectangle && e.rectangle.id === rectangleId)[0];

    return entity.rectangle;
  }

  setRectangleAttribute = (rectangleId: string, attributeKey: string, attributeValue: any) => {
    const rectangle = this.getRectangle(rectangleId);

    if (rectangle) {
      rectangle.attributes[attributeKey] = attributeValue;
    }
  }

  addPoint = (entityId: string) => {
    const entity = this.getEntity(entityId);

    const pointId = this.getUniqueId();

    entity.points.push({ id: pointId, attributes: { "Size": "MEDIUM" }, x: 0, y: 0 });

    return pointId;
  }

  getPoint = (pointId: string) => {
    const entity = this.game.entities.filter(e => e.points.filter(p => p.id === pointId).length > 0)[0];

    return entity.points.filter(p => p.id === pointId)[0];
  }

  deletePoint = (pointId: string) => {
    const entity = this.game.entities.filter(e => e.points.filter(p => p.id === pointId).length > 0)[0];
    const point = this.getPoint(pointId);

    const pointIndex = entity.points.indexOf(point);
    entity.points.splice(pointIndex, 1);
  }

  setPointAttribute = (pointId: string, attributeKey: string, attributeValue: any) => {
    const point = this.getPoint(pointId);

    point.attributes[attributeKey] = attributeValue;
  }

  addLine = (entityId: string) => {
    const entity = this.getEntity(entityId);

    const lineId = this.getUniqueId();
    const vertex1Id = this.getUniqueId();
    const vertex2Id = this.getUniqueId();

    entity.lines.push({ id: lineId, attributes: { "IsClosed": false }, vertices: [{ id: vertex1Id, x: -10, y: -10 }, { id: vertex2Id, x: 10, y: 10 }] });

    return lineId;
  }

  getLine = (lineId: string) => {
    const entity = this.game.entities.filter(e => e.lines.filter(l => l.id === lineId).length > 0)[0];

    return entity.lines.filter(l => l.id === lineId)[0];
  }

  getLineWithVertex = (vertexId: string) => {
    const entity = this.game.entities.filter(e => e.lines.filter(l => l.vertices.filter(v => v.id === vertexId).length > 0).length > 0)[0];

    return entity.lines.filter(l => l.vertices.filter(v => v.id === vertexId).length > 0)[0];
  }

  setLineAttribute = (lineId: string, attributeKey: string, attributeValue: any) => {
    const line = this.getLine(lineId);

    if (line) {
      line.attributes[attributeKey] = attributeValue;
    }
  }

  addVertex = (featureId: string) => {
    const vertexId = this.getUniqueId();

    const featureIsLine = this.game.entities.filter(e => e.lines.filter(l => l.id === featureId).length > 0).length > 0;

    if (featureIsLine) {
      const line = this.getLine(featureId);
      const prevVertex = line.vertices[line.vertices.length - 1];

      line.vertices.push({ id: vertexId, x: prevVertex.x, y: prevVertex.y });

      return vertexId;
    } else {
      const line = this.getLineWithVertex(featureId);
      const prevVertex = this.getVertex(featureId);

      const vertex = { id: vertexId, x: prevVertex.x, y: prevVertex.y };

      for (let i = 0; i < line.vertices.length; i++) {
        if (line.vertices[i].id === featureId) {
          line.vertices.splice(i + 1, 0, vertex);
          break;
        }
      }

      return vertexId;
    }
  }

  getVertex = (vertexId: string) => {
    const entity = this.game.entities.filter(e => e.lines.filter(l => l.vertices.filter(v => v.id === vertexId).length > 0).length > 0)[0];

    const line = entity.lines.filter(l => l.vertices.filter(v => v.id === vertexId).length > 0)[0];

    return line.vertices.filter(v => v.id === vertexId)[0];
  }

  addEntityGroupType = () => {
    const entityGroupTypeId = this.getUniqueId();

    this.game.entityGroupTypes.push({ id: entityGroupTypeId, name: `Group Type ${this.game.entityGroupTypes.length + 1}` });

    return entityGroupTypeId;
  }

  getEntityGroupType = (entityGroupTypeId: string) => {
    return this.game.entityGroupTypes.filter(t => t.id === entityGroupTypeId)[0];
  }

  getEntityGroupTypes = () => {
    return this.game.entityGroupTypes;
  }

  addEntityGroup = (entityGroupTypeId: string) => {
    const entityGroupId = this.getUniqueId();

    this.game.entityGroups.push({ id: entityGroupId, entityGroupTypeId: entityGroupTypeId, entityIds: [] });

    return entityGroupId;
  }

  deleteEntityGroup = (entityGroupId: string) => {
    const entityGroup = this.getEntityGroup(entityGroupId);

    const entityGroupIndex = this.game.entityGroups.indexOf(entityGroup);
    this.game.entityGroups.splice(entityGroupIndex, 1);
  }

  getEntityGroups = () => {
    return this.game.entityGroups;
  }

  getEntityGroupsWithEntity = (entityId: string) => {
    return this.game.entityGroups.filter(g => g.entityIds.indexOf(entityId) !== -1);
  }

  getEntityGroup = (entityGroupId: string) => {
    return this.game.entityGroups.filter(g => g.id === entityGroupId)[0];
  }

  addEntityToGroup = (entityGroupId: string, entityId: string) => {
    const entityGroup = this.getEntityGroup(entityGroupId);

    if (entityGroup.entityIds.indexOf(entityId) === -1) {
      entityGroup.entityIds.push(entityId);
    }
  }

  addFeatureCollection = () => {
    const featureCollectionId = this.getUniqueId();

    this.game.featureCollections.push({ id: featureCollectionId, name: `Symbol Group ${this.game.featureCollections.length + 1}`, color: TovelundColor.BluishGreen, set: [] });

    return featureCollectionId;
  }

  getFeatureCollections = () => {
    return this.game.featureCollections;
  }

  getFeatureCollection = (featureCollectionId: string) => {
    return this.game.featureCollections.filter(c => c.id === featureCollectionId)[0];
  }

  addFeature = (featureCollectionId: string, type: string, name: string, symbol: string) => {
    const featureCollection = this.getFeatureCollection(featureCollectionId);

    const featureId = this.getUniqueId();

    featureCollection.set.push({ id: featureId, type: type, name: name, symbol: symbol });
  }

  getFeature = (featureId: string) => {
    const featureCollection = this.game.featureCollections.filter(c => c.set.filter(f => f.id === featureId).length > 0)[0];

    return featureCollection.set.filter(f => f.id === featureId)[0];
  }

  changeFeatureCollectionName = (featureCollectionId: string, name: string) => {
    const featureCollection = this.getFeatureCollection(featureCollectionId);

    featureCollection.name = name;
  }

  setFeatureCollectionColor = (featureCollectionId: string, color: string) => {
    const featureCollection = this.getFeatureCollection(featureCollectionId);

    featureCollection.color = color;
  }

  getAvailableFeatureSymbols = () => {
    const availableFeatureSymbols: string[] = [];

    this.alphabet.split("").map((featureSymbol: string) => {
      if (this.game.featureCollections.filter(c => c.set.filter(e => e.symbol === featureSymbol).length > 0).length === 0) {
        availableFeatureSymbols.push(featureSymbol);
      }
    });

    return availableFeatureSymbols;
  }

  addClue = () => {
    const clueId = this.getUniqueId();

    this.game.clues.push({ id: clueId, description: `Clue ${this.game.clues.length + 1}`, rules: [] });

    return clueId;
  }

  changeClueDescription = (clueId: string, description: string) => {
    const clue = this.getClue(clueId);

    clue.description = description;
  }

  moveClueUp = (clueId: string) => {
    const clue = this.getClue(clueId);

    const clues = this.game.clues;
    const clueIndex = clues.indexOf(clue);

    clues.splice(clueIndex, 1);
    clues.splice(clueIndex - 1, 0, clue);

    this.game.clues = clues;
  }

  moveEntityUp = (entityId: string) => {
    const entity = this.getEntity(entityId);

    const entities = this.game.entities;
    const entityIndex = entities.indexOf(entity);

    entities.splice(entityIndex, 1);
    entities.splice(entityIndex - 1, 0, entity);

    this.game.entities = entities;
  }

  getClue = (clueId: string) => {
    return this.game.clues.filter(c => c.id === clueId)[0];
  }

  deleteClue = (clueId: string) => {
    const clue = this.getClue(clueId);

    const clueIndex = this.game.clues.indexOf(clue);
    this.game.clues.splice(clueIndex, 1);
  }

  getClues = () => {
    return this.game.clues;
  }

  toggleCheckClue = (clueId: string) => {
    const clue = this.getClue(clueId);

    clue.checked = !clue.checked;
    delete clue.passes;
  }

  addRelationshipRule = (clueId: string) => {
    const clue = this.getClue(clueId);

    const ruleId = this.getUniqueId();

    const rule: TovelundRelationshipRule = {
      id: ruleId,
      type: "RELATIONSHIP",
      entityGroupTypeIds: [],
      mode: "INCLUDE",
      logic: "OR",
      featureStartIds: [],
      featureEndIds: []
    };

    clue.rules.push(rule);

    return ruleId;
  }

  setRelationshipRuleMode = (ruleId: string, mode: string) => {
    const rule = this.getRule(ruleId);
    const relationshipRule = rule as TovelundRelationshipRule;

    relationshipRule.mode = mode;
  }

  setRelationshipRuleLogic = (ruleId: string, logic: string) => {
    const rule = this.getRule(ruleId);
    const relationshipRule = rule as TovelundRelationshipRule;

    relationshipRule.logic = logic;
  }

  addFeatureStartToRelationshipRule = (ruleId: string, featureId: string) => {
    const rule = this.getRule(ruleId);
    const relationshipRule = rule as TovelundRelationshipRule;

    if (relationshipRule.featureStartIds.indexOf(featureId) === -1) {
      relationshipRule.featureStartIds.push(featureId);
    }
  }

  addFeatureEndToRelationshipRule = (ruleId: string, featureId: string) => {
    const rule = this.getRule(ruleId);
    const relationshipRule = rule as TovelundRelationshipRule;

    if (relationshipRule.featureEndIds.indexOf(featureId) === -1) {
      relationshipRule.featureEndIds.push(featureId);
    }
  }

  addQuantityRule = (clueId: string) => {
    const clue = this.getClue(clueId);

    const ruleId = this.getUniqueId();

    const rule: TovelundQuantityRule = {
      id: ruleId,
      type: "QUANTITY",
      featureIds: [],
      quantities: []
    };

    clue.rules.push(rule);

    return ruleId;
  }

  addFeatureToQuantityRule = (ruleId: string, featureId: string) => {
    const rule = this.getRule(ruleId);
    const quantityRule = rule as TovelundQuantityRule;

    if (quantityRule.featureIds.indexOf(featureId) === -1) {
      quantityRule.featureIds.push(featureId);
    }
  }

  changeQuantitiesOfQuantityRule = (ruleId: string, quantities: number[]) => {
    const rule = this.getRule(ruleId);
    const quantityRule = rule as TovelundQuantityRule;

    quantityRule.quantities = quantities;
  }

  addDistanceRule = (clueId: string) => {
    const clue = this.getClue(clueId);

    const ruleId = this.getUniqueId();

    const rule: TovelundDistanceRule = {
      id: ruleId,
      type: "DISTANCE",
      entityGroupTypeIds: [],
      mode: "MATCH",
      featureStartIds: [],
      featureMiddleIds: [],
      featureEndIds: []
    };

    clue.rules.push(rule);

    return ruleId;
  }

  setDistanceRuleMode = (ruleId: string, mode: string) => {
    const rule = this.getRule(ruleId);
    const distanceRule = rule as TovelundDistanceRule;

    distanceRule.mode = mode;
  }

  addFeatureStartToDistanceRule = (ruleId: string, featureId: string) => {
    const rule = this.getRule(ruleId);
    const distanceRule = rule as TovelundDistanceRule;

    if (distanceRule.featureStartIds.indexOf(featureId) === -1) {
      distanceRule.featureStartIds.push(featureId);
    }
  }

  addFeatureMiddleToDistanceRule = (ruleId: string, featureId: string) => {
    const rule = this.getRule(ruleId);
    const distanceRule = rule as TovelundDistanceRule;

    if (distanceRule.featureMiddleIds.indexOf(featureId) === -1) {
      distanceRule.featureMiddleIds.push(featureId);
    }
  }

  addFeatureEndToDistanceRule = (ruleId: string, featureId: string) => {
    const rule = this.getRule(ruleId);
    const distanceRule = rule as TovelundDistanceRule;

    if (distanceRule.featureEndIds.indexOf(featureId) === -1) {
      distanceRule.featureEndIds.push(featureId);
    }
  }

  addSequenceRule = (clueId: string) => {
    const clue = this.getClue(clueId);

    const ruleId = this.getUniqueId();

    const rule: TovelundSequenceRule = {
      id: ruleId,
      type: "SEQUENCE",
      entityGroupTypeIds: [],
      mode: "MATCH",
      canRevisit: false,
      featureIds: [[]]
    };

    clue.rules.push(rule);

    return ruleId;
  }

  setSequenceRuleMode = (ruleId: string, mode: string) => {
    const rule = this.getRule(ruleId);
    const sequenceRule = rule as TovelundSequenceRule;

    sequenceRule.mode = mode;
  }

  addIndexToSequenceRule = (ruleId: string) => {
    const rule = this.getRule(ruleId);
    const sequenceRule = rule as TovelundSequenceRule;

    sequenceRule.featureIds.push([]);
  }

  addFeatureToSequenceAtIndex = (ruleId: string, index: number, featureId: string) => {
    const rule = this.getRule(ruleId);
    const sequenceRule = rule as TovelundSequenceRule;

    if (sequenceRule.featureIds[index].indexOf(featureId) === -1) {
      sequenceRule.featureIds[index].push(featureId);
    }
  }

  setSequenceCanRevisit = (ruleId: string, canRevisit: boolean) => {
    const rule = this.getRule(ruleId);
    const sequenceRule = rule as TovelundSequenceRule;

    sequenceRule.canRevisit = canRevisit;
  }

  getRule = (ruleId: string) => {
    const clue = this.game.clues.filter(c => c.rules.filter(r => r.id === ruleId).length > 0)[0];

    return clue.rules.filter(r => r.id === ruleId)[0];
  }

  deleteRule = (ruleId: string) => {
    const clue = this.game.clues.filter(c => c.rules.filter(r => r.id === ruleId).length > 0)[0];
    const rule = this.getRule(ruleId);

    const ruleIndex = clue.rules.indexOf(rule);
    clue.rules.splice(ruleIndex, 1);
  }

  changeX = (elementType: string, elementId: string, x: number) => {
    if (elementType === TovelundElementType.Rectangle) {
      const rectangle = this.getRectangle(elementId);

      if (rectangle) {
        rectangle.x = Number(x);
      }
    } else if (elementType === TovelundElementType.Point) {
      this.getPoint(elementId).x = Number(x);
    } else if (elementType === TovelundElementType.Line) {
      const vertices = this.getLine(elementId).vertices;
      const xOffset = vertices[0].x - Number(x);

      for (var i = 0; i < vertices.length; i++) {
        vertices[i].x = vertices[i].x - xOffset;
      }
    } else if (elementType === TovelundElementType.Vertex) {
      this.getVertex(elementId).x = Number(x);
    }
  }

  changeY = (elementType: string, elementId: string, y: number) => {
    if (elementType === TovelundElementType.Rectangle) {
      const rectangle = this.getRectangle(elementId);

      if (rectangle) {
        rectangle.y = Number(y);
      }
    } else if (elementType === TovelundElementType.Point) {
      this.getPoint(elementId).y = Number(y);
    } else if (elementType === TovelundElementType.Line) {
      const vertices = this.getLine(elementId).vertices;
      const xOffset = vertices[0].y - Number(y);

      for (var i = 0; i < vertices.length; i++) {
        vertices[i].y = vertices[i].y - xOffset;
      }
    } else if (elementType === TovelundElementType.Vertex) {
      this.getVertex(elementId).y = Number(y);
    }
  }

  setScale = (scale: number) => {
    this.game.scale = scale;
  }

  getScale = () => {
    return this.game.scale;
  }

  clearMarkings = () => {
    this.game.entities.map((entity: TovelundEntity) => {
      entity.selectedFeatureId = undefined;
      delete entity.innerPencilFeatureIds;
      delete entity.outerPencilFeatureIds;
    });

    this.game.clues.map((clue: TovelundClue) => {
      delete clue.passes;
    });
  }

  processEntities = (entityFeatures: { entityId: string, features: { featureId: string, featureState: boolean }[] }[], entityIndex: number) => {
    let solutionCount: number = 0;

    const entity = this.getEntity(entityFeatures[entityIndex].entityId);
    const features = [...entityFeatures[entityIndex].features];

    for (let featureIndex = 0; featureIndex < entityFeatures[entityIndex].features.length; featureIndex++) {
      const feature = entityFeatures[entityIndex].features[featureIndex];

      entity.selectedFeatureId = feature.featureId;

      if (entityIndex < entityFeatures.length - 1) {
        const extra = this.processEntities(entityFeatures, entityIndex + 1);

        if (extra > 0) {
          features[featureIndex] = { featureId: feature.featureId, featureState: true };
          solutionCount += this.processEntities(entityFeatures, entityIndex + 1);
        }
      } else {
        const passes = this.checkSolution();

        if (passes) {
          features[featureIndex] = { featureId: feature.featureId, featureState: true };
          solutionCount++;
        }
      }
    }

    entityFeatures[entityIndex].features = features;

    return solutionCount;
  }

  countSolutions = () => {
    const entityFeatures: { entityId: string, features: { featureId: string, featureState: boolean }[] }[] = [];

    this.game.entities.map((entity: TovelundEntity) => {
      if (entity.fixedFeatureId === undefined) {
        const featureCollection = this.getFeatureCollection(entity.featureCollectionId);
        const features: { featureId: string, featureState: boolean }[] = [];

        featureCollection.set.map((feature: TovelundFeature, index: number) => {
          features[index] = { featureId: feature.id, featureState: false };
        });

        entityFeatures.push({ entityId: entity.id, features: features });
      }
    });

    const solutionCount = this.processEntities(entityFeatures, 0);

    for (let i = 0; i < entityFeatures.length; i++) {
      const entity = this.getEntity(entityFeatures[i].entityId);

      if (entity.innerPencilFeatureIds == undefined) {
        entity.innerPencilFeatureIds = [];
      }

      for (let j = 0; j < entityFeatures[i].features.length; j++) {
        if (entityFeatures[i].features[j].featureState === true) {
          entity.innerPencilFeatureIds.push(entityFeatures[i].features[j].featureId);
        }
      }
    }

    this.game.entities.map((entity: TovelundEntity) => {
      entity.selectedFeatureId = undefined;
    });

    return solutionCount;
  }

  visitGroup = (group: TovelundEntityGroup, entityGroupTypeIds: string[], visitedGroupIds: string[], entityMiddleIds: string[], entityEndId: string, currentDistance: number) => {
    if (group.entityIds.indexOf(entityEndId) !== -1) {
      return currentDistance
    }

    let minimumDistance = -1;

    entityMiddleIds.map((entityMiddleId: string) => {
      if (group.entityIds.indexOf(entityMiddleId) !== -1) {
        const nextGroups = this.getEntityGroupsWithEntity(entityMiddleId).filter(g => entityGroupTypeIds.indexOf(g.entityGroupTypeId) !== -1).filter(g => visitedGroupIds.indexOf(g.id) === -1);

        nextGroups.map((nextGroup: TovelundEntityGroup) => {
          const nextGroupIds = [...visitedGroupIds];
          nextGroupIds.push(nextGroup.id);

          const distance = this.visitGroup(nextGroup, entityGroupTypeIds, nextGroupIds, entityMiddleIds, entityEndId, currentDistance + 1);

          if (minimumDistance === -1 || (distance !== -1 && minimumDistance > distance)) {
            minimumDistance = distance;
          }
        });
      }
    });

    return minimumDistance;
  }

  calculateMinimumDistance = (entityGroupTypeIds: string[], entityStartId: string, entityMiddleIds: string[], entityEndId: string) => {
    let minimumDistance = -1;

    const groups = this.getEntityGroupsWithEntity(entityStartId).filter(g => entityGroupTypeIds.indexOf(g.entityGroupTypeId) !== -1);

    groups.map((group: TovelundEntityGroup) => {
      const distance = this.visitGroup(group, entityGroupTypeIds, [group.id], entityMiddleIds, entityEndId, 0);

      if (minimumDistance === -1 || (distance !== -1 && minimumDistance > distance)) {
        minimumDistance = distance;
      }
    });

    return minimumDistance;
  }

  traverseFromGroup = (group: TovelundEntityGroup, entityGroupTypeIds: string[], visitedGroupIds: string[], sequenceEntityIds: string[][]) => {
    if (sequenceEntityIds.length === 0) {
      return true;
    } else {
      let canTraverse = false;

      const nextEntities = [...sequenceEntityIds].slice(1);

      sequenceEntityIds[0].map((entityId: string) => {
        if (group.entityIds.indexOf(entityId) !== -1) {
          const groupIds = [...visitedGroupIds];
          if (groupIds.indexOf(group.id) !== -1) {
            groupIds.push(group.id);
          }

          const thisGroupCanTraverseAgain = this.traverseFromGroup(group, entityGroupTypeIds, groupIds, nextEntities);

          if (thisGroupCanTraverseAgain) {
            canTraverse = true
          } else {
            const nextGroups = this.getEntityGroupsWithEntity(entityId).filter(g => entityGroupTypeIds.indexOf(g.entityGroupTypeId) !== -1).filter(g => visitedGroupIds.indexOf(g.id) === -1);

            nextGroups.map((nextGroup: TovelundEntityGroup) => {
              const nextGroupIds = [...visitedGroupIds];
              nextGroupIds.push(nextGroup.id);

              const canTraverseFromGroup = this.traverseFromGroup(nextGroup, entityGroupTypeIds, nextGroupIds, nextEntities);

              if (canTraverseFromGroup) {
                canTraverse = true;
              }
            });
          }
        } else {
            return false;
        }
      });

      return canTraverse;
    }
  }

  traverseSequence = (entityGroupTypeIds: string[], sequenceEntityIds: string[][]) => {
    let canTraverse = false;

    sequenceEntityIds[0].map((entityId: string) => {
      const groups = this.getEntityGroupsWithEntity(entityId).filter(g => entityGroupTypeIds.indexOf(g.entityGroupTypeId) !== -1);

      groups.map((group: TovelundEntityGroup) => {
        const nextEntities = [...sequenceEntityIds].slice(1);

        const canTraverseFromGroup: boolean = this.traverseFromGroup(group, entityGroupTypeIds, [group.id], nextEntities);

        if (canTraverseFromGroup) {
          canTraverse = true;
        }
      });
    });

    return canTraverse;
  }

  checkSolution = () => {
    let solutionPasses = true;

    this.game.clues.map((clue: TovelundClue) => {
      delete clue.checked;
      clue.passes = true;

      clue.rules.map((rule: ITovelundRule) => {
        if (rule.type === "QUANTITY") {
          const quantityRule = rule as TovelundQuantityRule;

          let count = 0;


          this.game.entities.map((entity: TovelundEntity) => {
            if ((entity.fixedFeatureId !== undefined && quantityRule.featureIds.indexOf(entity.fixedFeatureId) !== -1) || (entity.selectedFeatureId !== undefined && quantityRule.featureIds.indexOf(entity.selectedFeatureId) !== -1)) {
              count++;
            }
          });

          if (quantityRule.quantities.indexOf(count) === -1) {
            clue.passes = false;
            solutionPasses = false;
          }
        } else if (rule.type === "RELATIONSHIP") {
          const relationshipRule = rule as TovelundRelationshipRule;

          if (relationshipRule.mode === "INCLUDE" && relationshipRule.logic === "OR") {
            let passes = true;

            this.game.entityGroups.filter(g => relationshipRule.entityGroupTypeIds.indexOf(g.entityGroupTypeId) !== -1).map((group: TovelundEntityGroup) => {
              group.entityIds.map((entityId1: string) => {
                const entity1 = this.getEntity(entityId1);

                relationshipRule.featureStartIds.map((featureStartId: string) => {
                  if (entity1.fixedFeatureId === featureStartId || entity1.selectedFeatureId === featureStartId) {
                    let entityPasses = false;

                    group.entityIds.filter(id => id !== entityId1).map((entityId2: string) => {
                      const entity2 = this.getEntity(entityId2);

                      relationshipRule.featureEndIds.map((featureEndId: string) => {
                        if (entity2.fixedFeatureId === featureEndId || entity2.selectedFeatureId === featureEndId) {
                          entityPasses = true;
                        }
                      });
                    });

                    if (!entityPasses) {
                      passes = false;
                    }
                  }
                });
              });
            });

            if (!passes) {
              clue.passes = false;
              solutionPasses = false;
            }
          } else if (relationshipRule.mode === "EXCLUDE" && relationshipRule.logic === "OR") {
            let fails = false;

            this.game.entityGroups.filter(g => relationshipRule.entityGroupTypeIds.indexOf(g.entityGroupTypeId) !== -1).map((group: TovelundEntityGroup) => {
              group.entityIds.map((entityId1: string) => {
                const entity1 = this.getEntity(entityId1);

                relationshipRule.featureStartIds.map((featureStartId: string) => {
                  if (entity1.fixedFeatureId === featureStartId || entity1.selectedFeatureId === featureStartId) {
                    let entityFails = false;

                    group.entityIds.filter(id => id !== entityId1).map((entityId2: string) => {
                      const entity2 = this.getEntity(entityId2);

                      relationshipRule.featureEndIds.map((featureEndId: string) => {
                        if (entity2.fixedFeatureId === featureEndId || entity2.selectedFeatureId === featureEndId) {
                          entityFails = true;
                        }
                      });
                    });

                    if (entityFails) {
                      fails = true;
                    }
                  }
                });
              });
            });

            if (fails) {
              clue.passes = false;
              solutionPasses = false;
            }
          } else {
            console.log(`relationship rule not defined for mode ${relationshipRule.mode} and logic ${relationshipRule.logic}`);
            clue.passes = false;
            solutionPasses = false;
          }
        } else if (rule.type === "DISTANCE") {
          const distanceRule = rule as TovelundDistanceRule;

          if (distanceRule.mode === "MATCH" || distanceRule.mode === "MISMATCH") {
            const entityStartIds: string[] = [];
            const entityMiddleIds: string[] = [];
            const entityEndIds: string[] = [];

            this.game.entities.map((entity: TovelundEntity) => {
              if ((entity.fixedFeatureId !== undefined && distanceRule.featureStartIds.indexOf(entity.fixedFeatureId) !== -1) || (entity.selectedFeatureId !== undefined && distanceRule.featureStartIds.indexOf(entity.selectedFeatureId) !== -1)) {
                entityStartIds.push(entity.id);
              }
              if ((entity.fixedFeatureId !== undefined && distanceRule.featureMiddleIds.indexOf(entity.fixedFeatureId) !== -1) || (entity.selectedFeatureId !== undefined && distanceRule.featureMiddleIds.indexOf(entity.selectedFeatureId) !== -1)) {
                entityMiddleIds.push(entity.id);
              }
              if ((entity.fixedFeatureId !== undefined && distanceRule.featureEndIds.indexOf(entity.fixedFeatureId) !== -1) || (entity.selectedFeatureId !== undefined && distanceRule.featureEndIds.indexOf(entity.selectedFeatureId) !== -1)) {
                entityEndIds.push(entity.id);
              }
            });

            const distances: number[] = [];

            if (entityStartIds.length > 0 && entityMiddleIds.length > 0 && entityEndIds.length > 0) {
              entityStartIds.map((entityStartId: string) => {
                entityEndIds.map((entityEndId: string) => {
                  const distance = this.calculateMinimumDistance(distanceRule.entityGroupTypeIds ,entityStartId, entityMiddleIds, entityEndId);

                  distances.push(distance);
                });
              });
            }

            const differentDistances: number[] = [];

            distances.map((distance: number) => {
              if (differentDistances.indexOf(distance) === -1) {
                differentDistances.push(distance);
              }
            });

            if (distanceRule.mode === "MATCH") {
              if (differentDistances.length > 1) {
                clue.passes = false;
                solutionPasses = false;
              }
            } else if (distanceRule.mode === "MISMATCH") {
              if (differentDistances.length !== distances.length) {
                clue.passes = false;
                solutionPasses = false;
              }
            }
          } else {
            console.log(`distance rule not defined for mode ${distanceRule.mode}`);
            clue.passes = false;
            solutionPasses = false;
          }
        } else if (rule.type === "SEQUENCE") {
          const sequenceRule = rule as TovelundSequenceRule;

          if (!sequenceRule.canRevisit) {
            const entitySequenceIds: string[][] = [];

            for (let i = 0; i < sequenceRule.featureIds.length; i++) {
              const sequenceIds = sequenceRule.featureIds[i];
              const entityIds: string[] = [];

              this.game.entities.map((entity: TovelundEntity) => {
                if ((entity.fixedFeatureId !== undefined && sequenceIds.indexOf(entity.fixedFeatureId) !== -1) || (entity.selectedFeatureId !== undefined && sequenceIds.indexOf(entity.selectedFeatureId) !== -1)) {
                  entityIds.push(entity.id);
                }
              });

              entitySequenceIds.push(entityIds);
            }

            const canTraverseSequence = this.traverseSequence(sequenceRule.entityGroupTypeIds, entitySequenceIds);

            if (sequenceRule.mode === "MATCH" && !canTraverseSequence) {
              clue.passes = false;
              solutionPasses = false;
            } else if (sequenceRule.mode === "MISMATCH" && canTraverseSequence) {
              clue.passes = false;
              solutionPasses = false;
            }
          } else {
            console.log(`distance rule not defined for mode ${sequenceRule.canRevisit ? "can revisit" : "can't revisit"}`);
            clue.passes = false;
            solutionPasses = false;
          }
        }
      });
    });

    return solutionPasses;
  }
}
