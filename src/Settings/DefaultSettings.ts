
export interface ISqlSettings {
  onStartSqlQueries: string;
}

export const SqlSettingsDefaults: ISqlSettings = {
  onStartSqlQueries: 'CREATE TABLE my_lookup(name,birthday);\nINSERT INTO my_lookup VALUES ("fred", 2000-02-03);',
};
