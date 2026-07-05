function StatCard({ title, value }) {
    return (
        <div className="bg-white
                      rounded-xl 
                        p-6
                        
                        text-center

                        shadow-md

                        border-2
                        border-transparent

                        hover:border-[var(--color-superheading)]
                        hover:shadow-lg
                        hover:-translate-y-1

                        transition-all
                        duration-300
                        ease-out




                        ">
            <h3 className="text-gray-500 
                            text-2xl 
                            font-medium 
                            text-center
                            ">
                {title}
            </h3>

            <p className="text-3xl 
                          font-bold
                          mt-2 
                          text-[var(--color-superheading)] 
                          text-center 
            ">
                {value}
            </p>
        </div>
    );
}

export default StatCard;