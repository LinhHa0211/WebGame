const SearchButton = () => {
    return (
        <div className="cursor-pointer p-2 lg:p-4 bg-webgame hover:bg-webgame-dark transition rounded-full text-white">
            <svg viewBox="0 0 32 32" 
            style={{display:'block', fill:'none', height:'16px', width:'16px', stroke: 'currentColor', strokeWidth:4, overflow:'visible'}}
            aria-hidden="true" role="presentation" focusable="false">
                <path fill="none" d="M13 24a11 11 0 1 0 0-22 11 11 0 0 0 0 22zm8-3 9 9"></path>
            </svg>
        </div>
    )
}
export default SearchButton