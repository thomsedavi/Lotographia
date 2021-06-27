import { TovelundPuzzleDesign, TovelundElementType, TovelundDistanceRule, TovelundSequenceRule, TovelundEntityGroup, TovelundFeature, TovelundRelationshipRule, ITovelundRule, TovelundQuantityRule, TovelundClue, TovelundEntity, TovelundFeatureCollection } from "./TovelundEnums";

export class TovelundPuzzleDesignClass {
  puzzleDesign: TovelundPuzzleDesign;
  usedIds: string[];

  idCharacters: string = "0123456789ABCDEF";
  alphabet: string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  constructor(puzzleDesign?: TovelundPuzzleDesign) {
    const usedIds: string[] = [];

    if (puzzleDesign) {
      puzzleDesign.clues.map((clue: { id: string, rules: { id: string }[] }) => {
        usedIds.push(clue.id);

        clue.rules.map((rule: { id: string }) => {
          usedIds.push(rule.id);
        });
      });

      puzzleDesign.entities.map((entity: { id: string, rectangle?: { id: string }, points: { id: string }[], lines: { id: string, vertices: { id: string }[] }[] }) => {
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

      puzzleDesign.featureCollections.map((collection: { id: string, set: { id: string }[] }) => {
        usedIds.push(collection.id);

        collection.set.map((entity: { id: string }) => {
          usedIds.push(entity.id);
        });
      });

      puzzleDesign.entityGroups.map((entityGroup: { id: string }) => {
        usedIds.push(entityGroup.id);
      });

      puzzleDesign.entityGroupTypes.map((groupType: { id: string }) => {
        usedIds.push(groupType.id);
      })
    } else {
      puzzleDesign = {
        scale: 100,
        entities: [],
        entityGroups: [],
        clues: [],
        featureCollections: [],
        entityGroupTypes: []
      };
    }

    this.puzzleDesign = puzzleDesign;
    this.usedIds = usedIds;
  }

  getJSON = () => {
    return JSON.stringify(this.puzzleDesign);
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

    this.puzzleDesign.entities.push({ id: entityId, name: `Entity ${this.puzzleDesign.entities.length + 1}`, points: [], lines: [], featureCollectionId: featureCollectionId });

    return entityId;
  }

  getEntities = () => {
    return this.puzzleDesign.entities;
  }

  getEntity = (entityId: string) => {
    return this.puzzleDesign.entities.filter(e => e.id === entityId)[0];
  }

  deleteEntity = (entityId: string) => {
    const entity = this.getEntity(entityId);

    const entityIndex = this.puzzleDesign.entities.indexOf(entity);
    this.puzzleDesign.entities.splice(entityIndex, 1);
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
    const entity = this.puzzleDesign.entities.filter(e => e.rectangle && e.rectangle.id === rectangleId)[0];

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
    const entity = this.puzzleDesign.entities.filter(e => e.points.filter(p => p.id === pointId).length > 0)[0];

    return entity.points.filter(p => p.id === pointId)[0];
  }

  deletePoint = (pointId: string) => {
    const entity = this.puzzleDesign.entities.filter(e => e.points.filter(p => p.id === pointId).length > 0)[0];
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
    const entity = this.puzzleDesign.entities.filter(e => e.lines.filter(l => l.id === lineId).length > 0)[0];

    return entity.lines.filter(l => l.id === lineId)[0];
  }

  getLineWithVertex = (vertexId: string) => {
    const entity = this.puzzleDesign.entities.filter(e => e.lines.filter(l => l.vertices.filter(v => v.id === vertexId).length > 0).length > 0)[0];

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

    const featureIsLine = this.puzzleDesign.entities.filter(e => e.lines.filter(l => l.id === featureId).length > 0).length > 0;

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
    const entity = this.puzzleDesign.entities.filter(e => e.lines.filter(l => l.vertices.filter(v => v.id === vertexId).length > 0).length > 0)[0];

    const line = entity.lines.filter(l => l.vertices.filter(v => v.id === vertexId).length > 0)[0];

    return line.vertices.filter(v => v.id === vertexId)[0];
  }

  addEntityGroupType = () => {
    const entityGroupTypeId = this.getUniqueId();

    this.puzzleDesign.entityGroupTypes.push({ id: entityGroupTypeId, name: `Group Type ${this.puzzleDesign.entityGroupTypes.length + 1}` });

    return entityGroupTypeId;
  }

  getEntityGroupType = (entityGroupTypeId: string) => {
    return this.puzzleDesign.entityGroupTypes.filter(t => t.id === entityGroupTypeId)[0];
  }

  getEntityGroupTypes = () => {
    return this.puzzleDesign.entityGroupTypes;
  }

  addEntityGroup = (entityGroupTypeId: string) => {
    const entityGroupId = this.getUniqueId();

    this.puzzleDesign.entityGroups.push({ id: entityGroupId, entityGroupTypeId: entityGroupTypeId, entityIds: [] });

    return entityGroupId;
  }

  deleteEntityGroup = (entityGroupId: string) => {
    const entityGroup = this.getEntityGroup(entityGroupId);

    const entityGroupIndex = this.puzzleDesign.entityGroups.indexOf(entityGroup);
    this.puzzleDesign.entityGroups.splice(entityGroupIndex, 1);
  }

  getEntityGroups = () => {
    return this.puzzleDesign.entityGroups;
  }

  getEntityGroupsWithEntity = (entityId: string) => {
    return this.puzzleDesign.entityGroups.filter(g => g.entityIds.indexOf(entityId) !== -1);
  }

  getEntityGroup = (entityGroupId: string) => {
    return this.puzzleDesign.entityGroups.filter(g => g.id === entityGroupId)[0];
  }

  addEntityToGroup = (entityGroupId: string, entityId: string) => {
    const entityGroup = this.getEntityGroup(entityGroupId);

    if (entityGroup.entityIds.indexOf(entityId) === -1) {
      entityGroup.entityIds.push(entityId);
    }
  }

  addFeatureCollection = () => {
    const featureCollectionId = this.getUniqueId();

    this.puzzleDesign.featureCollections.push({ id: featureCollectionId, name: `Symbol Group ${this.puzzleDesign.featureCollections.length + 1}`, color: "GREEN", set: [] });

    return featureCollectionId;
  }

  getFeatureCollections = () => {
    return this.puzzleDesign.featureCollections;
  }

  getFeatureCollection = (featureCollectionId: string) => {
    return this.puzzleDesign.featureCollections.filter(c => c.id === featureCollectionId)[0];
  }

  addFeature = (featureCollectionId: string, type: string, name: string, symbol: string) => {
    const featureCollection = this.getFeatureCollection(featureCollectionId);

    const featureId = this.getUniqueId();

    featureCollection.set.push({ id: featureId, type: type, name: name, symbol: symbol });
  }

  deleteFeature = (featureId: string) => {
    const featureCollection = this.puzzleDesign.featureCollections.filter(c => c.set.filter(f => f.id === featureId).length > 0)[0];
    const feature = this.getFeature(featureId);

    const featureIndex = featureCollection.set.indexOf(feature);
    featureCollection.set.splice(featureIndex, 1);
  }

  getFeature = (featureId: string) => {
    const featureCollection = this.puzzleDesign.featureCollections.filter(c => c.set.filter(f => f.id === featureId).length > 0)[0];

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
      if (this.puzzleDesign.featureCollections.filter(c => c.set.filter(e => e.symbol === featureSymbol).length > 0).length === 0) {
        availableFeatureSymbols.push(featureSymbol);
      }
    });

    return availableFeatureSymbols;
  }

  addClue = () => {
    const clueId = this.getUniqueId();

    this.puzzleDesign.clues.push({ id: clueId, description: `Clue ${this.puzzleDesign.clues.length + 1}`, rules: [] });

    return clueId;
  }

  changeClueDescription = (clueId: string, description: string) => {
    const clue = this.getClue(clueId);

    clue.description = description;
  }

  moveClueUp = (clueId: string) => {
    const clue = this.getClue(clueId);

    const clues = this.puzzleDesign.clues;
    const clueIndex = clues.indexOf(clue);

    clues.splice(clueIndex, 1);
    clues.splice(clueIndex - 1, 0, clue);

    this.puzzleDesign.clues = clues;
  }

  moveEntityUp = (entityId: string) => {
    const entity = this.getEntity(entityId);

    const entities = this.puzzleDesign.entities;
    const entityIndex = entities.indexOf(entity);

    entities.splice(entityIndex, 1);
    entities.splice(entityIndex - 1, 0, entity);

    this.puzzleDesign.entities = entities;
  }

  getClue = (clueId: string) => {
    return this.puzzleDesign.clues.filter(c => c.id === clueId)[0];
  }

  deleteClue = (clueId: string) => {
    const clue = this.getClue(clueId);

    const clueIndex = this.puzzleDesign.clues.indexOf(clue);
    this.puzzleDesign.clues.splice(clueIndex, 1);
  }

  getClues = () => {
    return this.puzzleDesign.clues;
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

  addGroupTypeToRelationshipRule = (ruleId: string, groupTypeId: string) => {
    const rule = this.getRule(ruleId);
    const relationshipRule = rule as TovelundRelationshipRule;

    if (relationshipRule.entityGroupTypeIds.indexOf(groupTypeId) === -1) {
      relationshipRule.entityGroupTypeIds.push(groupTypeId);
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
    const clue = this.puzzleDesign.clues.filter(c => c.rules.filter(r => r.id === ruleId).length > 0)[0];

    return clue.rules.filter(r => r.id === ruleId)[0];
  }

  deleteRule = (ruleId: string) => {
    const clue = this.puzzleDesign.clues.filter(c => c.rules.filter(r => r.id === ruleId).length > 0)[0];
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
    this.puzzleDesign.scale = scale;
  }

  getScale = () => {
    return this.puzzleDesign.scale;
  }

  clearMarkings = () => {
    this.puzzleDesign.entities.map((entity: TovelundEntity) => {
      entity.selectedFeatureId = undefined;
      delete entity.innerPencilFeatureIds;
      delete entity.outerPencilFeatureIds;
    });

    this.puzzleDesign.clues.map((clue: TovelundClue) => {
      delete clue.passes;
    });
  }

  processEntities = (entityFeatures: { entityId: string, features: { featureId: string, featureState: boolean }[] }[], maxFeatureCounts: { [featureId: string]: number }, entityIndex: number) => {
    let solutionAttempt: number = 0;
    let solutionCount: number = 0;

    const entity = this.getEntity(entityFeatures[entityIndex].entityId);
    const features = [...entityFeatures[entityIndex].features];

    for (let featureIndex = 0; featureIndex < entityFeatures[entityIndex].features.length; featureIndex++) {
      const feature = entityFeatures[entityIndex].features[featureIndex];

      if (maxFeatureCounts[feature.featureId] > 0) {
        const nextMaxFeatureCounts = { ...maxFeatureCounts };
        nextMaxFeatureCounts[feature.featureId] = nextMaxFeatureCounts[feature.featureId] - 1;

        entity.selectedFeatureId = feature.featureId;

        if (entityIndex < entityFeatures.length - 1) {
          const extra = this.processEntities(entityFeatures, nextMaxFeatureCounts, entityIndex + 1);
          solutionAttempt += extra.solutionAttempt;
          solutionCount += extra.solutionCount;

          if (extra.solutionCount > 0) {
            features[featureIndex] = { featureId: feature.featureId, featureState: true };
            //const newSolutionCount = this.processEntities(entityFeatures, entityIndex + 1);

            //solutionAttempt += newSolutionCount.solutionAttempt;
            //solutionCount += newSolutionCount.solutionCount;
          }
        } else {
          solutionAttempt++;
          const passes = this.checkSolution();

          if (passes) {
            features[featureIndex] = { featureId: feature.featureId, featureState: true };
            solutionCount++;
          }
        }
      }
    }

    entityFeatures[entityIndex].features = features;

    return {
      solutionCount: solutionCount,
      solutionAttempt: solutionAttempt
    };
  }

  countSolutions = () => {
    const entityFeatures: { entityId: string, features: { featureId: string, featureState: boolean }[] }[] = [];

    this.puzzleDesign.entities.map((entity: TovelundEntity) => {
      if (entity.fixedFeatureId === undefined) {
        const featureCollection = this.getFeatureCollection(entity.featureCollectionId);
        const features: { featureId: string, featureState: boolean }[] = [];

        featureCollection.set.map((feature: TovelundFeature, index: number) => {
          features[index] = { featureId: feature.id, featureState: false };
        });

        entityFeatures.push({ entityId: entity.id, features: features });
      }
    });

    const maxFeatureCounts: { [featureId: string]: number } = {};

    this.puzzleDesign.featureCollections.map((featureCollection: TovelundFeatureCollection) => {
      featureCollection.set.map((feature: TovelundFeature) => {
        if (this.puzzleDesign.entities.filter(e => e.featureCollectionId === featureCollection.id && e.fixedFeatureId === undefined).length > 0) {
          maxFeatureCounts[feature.id] = -1;
        }
      });
    });

    this.puzzleDesign.clues.map((clue: TovelundClue) => {
      clue.rules.map((rule: ITovelundRule) => {
        if (rule.type === "QUANTITY") {
          const quantityRule = rule as TovelundQuantityRule;

          quantityRule.featureIds.map((featureId: string) => {
            maxFeatureCounts[featureId] = [...quantityRule.quantities].sort()[quantityRule.quantities.length - 1];
          });
        }
      });
    });

    console.log(maxFeatureCounts);

    if (Object.values(maxFeatureCounts).filter(c => c === -1).length > 0) {
      console.log("not enough quantity restrictions");
      return -1;
    }

    this.puzzleDesign.entities.map((entity: TovelundEntity) => {
      delete entity.innerPencilFeatureIds;
      delete entity.outerPencilFeatureIds;
    });

    const solutionCount = this.processEntities(entityFeatures, maxFeatureCounts, 0);
    console.log(solutionCount.solutionAttempt);
    
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
    
    this.puzzleDesign.entities.map((entity: TovelundEntity) => {
      entity.selectedFeatureId = undefined;
    });

    return solutionCount.solutionCount;
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

    this.puzzleDesign.clues.map((clue: TovelundClue) => {
      delete clue.checked;
      clue.passes = true;

      clue.rules.map((rule: ITovelundRule) => {
        if (rule.type === "QUANTITY") {
          const quantityRule = rule as TovelundQuantityRule;

          let count = 0;

          this.puzzleDesign.entities.map((entity: TovelundEntity) => {
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

            this.puzzleDesign.entityGroups.filter(g => relationshipRule.entityGroupTypeIds.indexOf(g.entityGroupTypeId) !== -1).map((group: TovelundEntityGroup) => {
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

            this.puzzleDesign.entityGroups.filter(g => relationshipRule.entityGroupTypeIds.indexOf(g.entityGroupTypeId) !== -1).map((group: TovelundEntityGroup) => {
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

            this.puzzleDesign.entities.map((entity: TovelundEntity) => {
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

              this.puzzleDesign.entities.map((entity: TovelundEntity) => {
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
