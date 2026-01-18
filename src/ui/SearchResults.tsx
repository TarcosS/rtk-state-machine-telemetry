import type { SearchResult } from "../features/search/searchSlice";

const SearchResults: React.FC<{items: SearchResult[]}> = ({items}) => {
    if (!items.length) return <p style={{marginTop: 12}}>No results.</p>

    return (
        <ul style={{
            marginTop: 12,
            paddingLeft: 16
        }}>
            {items.map((x) => (
                    <li
                        key={x.id}
                        style={{
                            padding: "8px 0",
                            borderBottom: "1px solid #eee",
                            lineHeight: 1.35
                        }}
                    >
                        {x.title}
                    </li>
                ))}
        </ul>
    )
}

export default SearchResults;