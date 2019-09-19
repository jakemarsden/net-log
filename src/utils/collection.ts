export class CollectionUtil {

    /**
     * @see https://docs.oracle.com/javase/8/docs/api/java/util/Map.html#computeIfAbsent-K-java.util.function.Function-
     */
    static computeIfAbsent<TKey, TVal>(map: Map<TKey, TVal>, key: TKey, mapper: (key: TKey) => TVal): TVal {
        let value = map.get(key)
        if (value === undefined) {
            value = mapper(key)
            map.set(key, value)
        }
        return value
    }

    private constructor() {
    }
}
