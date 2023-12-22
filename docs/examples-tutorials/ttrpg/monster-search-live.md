---
searching_type: aasimar
selected_entity: Aasimar Redeemer
---

```qatt
query: |
  SELECT TOP 5
  FROM (SELECT traits->[join](',') AS MergedTraits, * FROM creatures_b1)
  WHERE pageProperty('searching_type')->toLowerCase() IN MergedTraits;
  SELECT DISTINCT Traits FROM (SELECT traits->0 AS Traits FROM creatures_b1
  UNION ALL
  SELECT traits->1 AS Traits FROM creatures_b1
  UNION ALL
  SELECT traits->2 AS Traits FROM creatures_b1
  UNION ALL
  SELECT traits->3 AS Traits FROM creatures_b1
  UNION ALL
  SELECT traits->4 AS Traits FROM creatures_b1
  UNION ALL
  SELECT traits->5 AS Traits FROM creatures_b1
  UNION ALL
  SELECT traits->6 AS Traits FROM creatures_b1
  UNION ALL
  SELECT traits->7 AS Traits FROM creatures_b1
  UNION ALL
  SELECT traits->8 AS Traits FROM creatures_b1
  UNION ALL
  SELECT traits->9 AS Traits FROM creatures_b1)
  WHERE Traits;
  SELECT *
  FROM creatures_b1
  WHERE pageProperty('selected_entity') = name;
template: |
  Type: `INPUT[inlineSelect(option('Any'){{#each result.[1]}},option({{Traits}}){{/each}}):searching_type]`

  | Name | HP  | AC  | Level  | Source |
  | ---  | --- | --- | --- | ---    | 
  {{#each result.[0]}}       
  |{{name}}|{{defenses.hp.[0].hp}}|{{defenses.ac.std}}|{{level}}|{{source}}|
  {{/each}}

  ## Select Name for Details
  `INPUT[inlineSelect(defaultValue('Select Entity'),option('Select Entity'){{#each result.[0]}},option({{name}}){{/each}}):selected_entity]`

  {{#each result.[2]}}       

  {{codeBlockHeader 'statblock'}}
  image: [[Wikilink To Image]]
  name: {{name}}
  size: string 
  type: string 
  subtype: string
  alignment: {{defenses.hp.[0].hp}} 
  hp: {{trim defenses.hp.[0].hp}}
  ac: {{defenses.ac.std}}
  speed: {{speed.walk}} 
  stats: [{{abilityMods.str}}, {{abilityMods.dex}}, {{abilityMods.con}}, {{abilityMods.int}}, {{abilityMods.wis}}, {{abilityMods.cha}}]
  {{codeBlockFooter}}

  {{/each}}

```

